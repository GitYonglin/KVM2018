using Microsoft.AspNetCore.SignalR;
using Modbus.ASCII;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace DeviceClient.Hubs
{
    public class PLCHub : Hub
    {
        private static ModbusSocket Z = null;
        private static ModbusSocket C = null;
        private static IHubCallerClients _clients = null;
        private static int TensionMode = -1;
        private static bool LoadOffDelayState = false;
        private static bool DelayState = false;
        private static bool AutoStopState = false;
        private static bool ZAutoStopState = false;
        private static bool CAutoStopState = false;
        private static bool AutoStopRunState = false;
        //private static bool ZAutoStopRunState = false;
        //private static bool CAutoStopRunState = false;
        private static bool ConnentState = false;

        private Affirm AutoLoadAffirm = new Affirm();
        private Affirm Stop2RunAffirm = new Affirm();
        private Affirm AutoStopAffirm = new Affirm();
        private Affirm SetDeviceParameterAffirm = new Affirm();
        public PLCHub()
        {
            TaskFactory tf = new TaskFactory();
            tf.StartNew(() => Console.WriteLine("重新请求连接" + Thread.CurrentThread.ManagedThreadId));

            //if (Z == null)
            //{
            //    Z = new ModbusSocket("192.168.181.101", 502, "主站", true);
            //    Z.ModbusLinkSuccess += ModbusLinkSuccess;
            //    Z.ModbusLinkError += ModbusLinkError;
            //}
            //if (C == null)
            //{
            //    C = new ModbusSocket("192.168.181.102", 502, "从站", false);
            //    C.ModbusLinkSuccess += ModbusLinkSuccess;
            //    C.ModbusLinkError += ModbusLinkError;
            //}
        }
        public void Init()
        {
            _clients = Clients;
        }
        public void Creates(bool connectState)
        {
            ConnentState = connectState;
            if (Z == null)
            {
                Z = new ModbusSocket("192.168.181.101", 502, "主站", true);
                Z.ModbusLinkSuccess += ModbusLinkSuccess;
                Z.ModbusLinkError += ModbusLinkError;
            }
            if (C == null && ConnentState)
            {
                C = new ModbusSocket("192.168.181.102", 502, "从站", false);
                C.ModbusLinkSuccess += ModbusLinkSuccess;
                C.ModbusLinkError += ModbusLinkError;
            }
            if (!ConnentState)
            {
                C.Client = null;
                C = null;
            }
        }
        /// <summary>
        /// 连接成功，启动心跳包连接
        /// </summary>
        /// <param name="id"></param>
        /// <param name="message"></param>
        public void ModbusLinkSuccess(string id, string message)
        {
            var device = Z;
            if (id == "从站")
            {
                device = C;
            }
            else
            {
                GetDeviceParameter(); // 获取设备参数
            }
            // 心跳包保证链接
            Task.Run(() =>
            {
                while (device != null && device.Client != null && device.Client.Connected && device.IsSuccess)
                {
                    device.F05(PLCSite.M(0), true, null);
                    device.F03(PLCSite.D(0), 10, (data) =>
                    {
                        var rdata = ReceiveData.F03(data, 10);
                        if (TensionMode > 0 && !AutoStopRunState && !AutoStopState)
                        {
                            AutoStop(rdata[6], device.Name);
                        }
                        _clients.All.SendAsync("LiveData", new { name = device.Name, data = rdata });
                    });
                    Thread.Sleep(10);
                }
            });
        }
        
        public void F03(InPLC data)
        {

            if (data.Id == 1)
            {
                Z.F03(PLCSite.D(data.Address), data.F03, (rdata) =>
                {
                    _clients.All.SendAsync("F03Return", new { name = Z.Name, data = ReceiveData.F03(rdata, data.F03) });
                });
            }
            else
            {
                C.F03(PLCSite.D(data.Address), data.F03, (rdata) =>
                {
                    _clients.All.SendAsync("F03Return", new { name = C.Name, data = ReceiveData.F03(rdata, data.F03) });
                });
            }
        }
        public void DF03(InPLC data)
        {
            Z.F03(PLCSite.D(data.Address), data.F03, (rdata) =>
            {
                _clients.All.SendAsync("F03Return", new { name = Z.Name, data = ReceiveData.F03(rdata, data.F03) });
            });
            C.F03(PLCSite.D(data.Address), data.F03, (rdata) =>
            {
                _clients.All.SendAsync("F03Return", new { name = C.Name, data = ReceiveData.F03(rdata, data.F03) });
            });
        }
        public void F05(InPLC data)
        {

            if (data.Id == 1)
            {
                Z.F05(data.Address, data.F05, null);
            }
            else
            {
                C.F05(data.Address, data.F05, null);
            }
        }
        public Boolean DF05(InPLC data)
        {
            Z.F05(PLCSite.M(data.Address), data.F05, null);
            C.F05(PLCSite.M(data.Address), data.F05, null);
            return true;
        }

        public void F06(InPLC data)
        {
            if (data.Id == 1)
            {
                Z.F06(PLCSite.D(data.Address), data.F06, null);
            }
            else
            {
                C.F06(PLCSite.D(data.Address), data.F06, null);
            }
        }
        public bool F16(InPLC data)
        {
            if (data.Id == 1)
            {
                Z.F16(PLCSite.D(data.Address), data.F16, null);
            }
            else
            {
                C.F16(PLCSite.D(data.Address), data.F16, null);
            }
            return true;
        }
        public void F01(InPLC data)
        {
            if (data.Id == 1)
            {
                Z.F01(data.Address, data.F01, (rData) =>
                {
                    _clients.All.SendAsync("noe", rData);
                });
            }
            else
            {
                C.F01(data.Address, data.F01, (rData) =>
                {
                    _clients.All.SendAsync("noe", rData);
                });
            }
        }

        /// <summary>
        /// 自动张拉F05
        /// </summary>
        /// <param name="mode"></param>
        /// <returns></returns>
        public Boolean AutoF05(InPLC data)
        {
            if (TensionMode == -1)
            {
                TensionMode = data.Mode;

            }
            Console.WriteLine("张拉启动");
            Console.WriteLine(TensionMode);
            if (TensionMode == 1 || TensionMode == 3 || TensionMode == 4)
            {
                C.F05(PLCSite.M(data.Address), data.F05, null);
            }

            Z.F05(PLCSite.M(data.Address), data.F05, null);
            LoadOffDelayState = false;
            DelayState = false;
            AutoStopRunState = false;
            ZAutoStopState = false;
            CAutoStopState = false;
            AutoStopState = false;
            ZAutoStopState = false;
            CAutoStopState = false;
            return true;
        }
        /// <summary>
        /// 卸荷
        /// </summary>
        /// <param name="data"></param>
        public void AutoLoadOff(TensionModle data)
        {
            if (AutoLoadAffirm.No == 0)
            {
                AutoLoadAffirm.No = 1;
                AutoLoadAffirm.AffirmNo = 0;
            }
            if (TensionMode == 1 || TensionMode == 3 || TensionMode == 4)
            {
                AutoLoadAffirm.No = 2;
                C.F16(PLCSite.D(412), new int[] { data.A2, data.B2 }, (d) =>
                {
                    AutoLoadOffAffirm();
                });
            }
            Z.F16(PLCSite.D(412), new int[] { data.A1, data.B1 }, (d) =>
            {
                AutoLoadOffAffirm();
            });
        }
        private void AutoLoadOffAffirm()
        {
            AutoLoadAffirm.AffirmIf(() => { AutoF05(new InPLC { Mode = TensionMode, Address = 521, F05 = true }); });
        }
        public void AutoOk()
        {
            TensionMode = -1;
            LoadOffDelayState = false;
            DelayState = false;
            AutoStopRunState = false;
            ZAutoStopState = false;
            CAutoStopState = false;
            AutoStopState = false;
            ZAutoStopState = false;
            CAutoStopState = false;
        }
        /// <summary>
        /// 通信错误事件
        /// </summary>
        /// <param name="id">主从Id</param>
        /// <param name="message">通信状态</param>
        public void ModbusLinkError(string id, string message)
        {
            if (_clients != null)
            {
                _clients.All.SendAsync("Send", new { Id = id, Message = message });
                if (TensionMode != -1)
                {
                    AutoStop(20, id);
                }
            }
        }

        private void AutoStop(int data, string id)
        {
            Console.WriteLine(id == "主站");
            Console.WriteLine(data);
            if ((data == 20 || data == 21) && !AutoStopState && !AutoStopRunState)
            {
                AutoStopAffirm.No = 1;
                AutoStopAffirm.AffirmNo = 0;
                if ((TensionMode == 1 || TensionMode == 3 || TensionMode == 4))
                {
                    AutoStopAffirm.No = 2;
                    if (C.Client != null && C.Client.Connected && C.IsSuccess && id == "主站")
                    {
                        C.F05(PLCSite.M(550), true, (d) =>
                        {
                            AutoStopState = true;
                        });
                    }
                } else if (id == "主站")
                {
                    AutoStopState = true;
                }
                if (Z.Client != null && Z.Client.Connected && Z.IsSuccess && id == "从站")
                {
                    Z.F05(PLCSite.M(550), true, (d) =>
                    {
                        AutoStopState = true;
                    });
                }

            }
            if (data != 20)
            {
                bool b = false;
                if (id == "主站")
                {
                    ZAutoStopState = true;
                }
                else
                {
                    CAutoStopState = true;
                }
                if (TensionMode == 1 || TensionMode == 3 || TensionMode == 4)
                {
                    if (ZAutoStopState && CAutoStopState)
                    {
                        b = true;
                    }
                }
                else if (ZAutoStopState)
                {
                    b = true;
                }
                if (b)
                {
                    ZAutoStopState = false;
                    CAutoStopState = false;
                    AutoStopState = false;
                    AutoStopRunState = false;
                    //ZAutoStopRunState = false;
                    //CAutoStopRunState = false;
                }
            }
        }
        /// <summary>
        /// 暂停启动
        /// </summary>
        public void Stop2Run()
        {
            Stop2RunAffirm.No = 1;
            Stop2RunAffirm.AffirmNo = 0;
            AutoStopRunState = true;
            Task.Run(() =>
            {
                Task.Delay(100);
                if (TensionMode == 1 || TensionMode == 3 || TensionMode == 4)
                {
                    Stop2RunAffirm.No = 2;
                    C.F05(PLCSite.M(550), false, (d) =>
                    {
                        Stop2RunAffirm.AffirmIf(() => SetStop2Run());
                    });
                }
                Z.F05(PLCSite.M(550), false, (d) =>
                {
                    Stop2RunAffirm.AffirmIf(() => SetStop2Run());
                });
            });
        }
        private void SetStop2Run()
        {
            ZAutoStopState = false;
            CAutoStopState = false;
            AutoStopState = false;
            AutoStopRunState = false;
            //ZAutoStopRunState = false;
            //CAutoStopRunState = false;
        }
        /// <summary>
        /// 阶段压力数据下载
        /// </summary>
        /// <param name="t"></param>
        public bool Tension(TensionModle t)
        {
            if (t.Mode == 0 || t.Mode == 2)
            {
                Z.F16(PLCSite.D(410), new int[] { t.A1, t.B1 }, null);
            }
            else
            {
                Z.F16(PLCSite.D(410), new int[] { t.A1, t.B1 }, null);
                C.F16(PLCSite.D(410), new int[] { t.A2, t.B2 }, null);
            }
            return true;
        }
        /// <summary>
        /// 确认压力数据下载
        /// </summary>
        /// <param name="t"></param>
        public bool AffirmMpa(TensionModle t)
        {
            if (t.Mode == 0 || t.Mode == 2)
            {
                Z.F16(PLCSite.D(414), new int[] { t.A1, t.B1 }, null);
            }
            else
            {
                Z.F16(PLCSite.D(414), new int[] { t.A1, t.B1 }, null);
                C.F16(PLCSite.D(414), new int[] { t.A2, t.B2 }, null);
            }
            return true;
        }
        public void ReturnSetMm(InPLC data)
        {
            if (TensionMode == 0 || TensionMode == 2)
            {
                Z.F16(PLCSite.D(416), new int[] { data.F06 }, null);
            }
            else
            {
                Z.F16(PLCSite.D(406), new int[] { data.F06 }, null);
                C.F16(PLCSite.D(406), new int[] { data.F06 }, null);
            }
        }
        /// <summary>
        /// 获取设备参数
        /// </summary>
        public void GetDeviceParameter()
        {
            if (ConnentState)
            {
                C.F03(PLCSite.D(500), 17, (data) =>
                {
                    _clients.All.SendAsync("DeviceParameter", new { name = C.Name, data = ReceiveData.F03(data, 17) });
                });
            }
            Z.F03(PLCSite.D(500), 17, (data) =>
            {
                _clients.All.SendAsync("DeviceParameter", new { name = Z.Name, data = ReceiveData.F03(data, 17) });
            });
        }

        public Boolean SetDeviceParameter(SetDeviceParameterData data)
        {
            try
            {
                if (ConnentState)
                {
                    C.F16(PLCSite.D(data.Address), data.Values, (r) => {
                        this.GetDeviceParameter();
                    });
                }
                Z.F16(PLCSite.D(data.Address), data.Values, (r) => {
                    this.GetDeviceParameter();
                });
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        /// <summary>
        /// 自动保压延时
        /// </summary>
        /// <param name="time"></param>
        public void Delay(int time)
        {
            if (!DelayState)
            {
                DelayState = true;
                int nowTime = 0;
                Task.Run(() =>
                {
                    while (time >= nowTime && TensionMode > 0)
                    {
                        if (time == nowTime)
                        {
                            _clients.All.SendAsync("DelayOk", nowTime);
                            DelayState = false;
                        }
                        else
                        {
                            _clients.All.SendAsync("Delay", nowTime);

                        }
                        Thread.Sleep(1000);
                        if (!AutoStopState)
                        {
                            nowTime++;

                        }
                    }
                });
            }
        }
        /// <summary>
        /// 自动卸荷延时
        /// </summary>
        /// <param name="time"></param>
        public void LoadOffDelay(int time)
        {
            if (!LoadOffDelayState)
            {
                LoadOffDelayState = true;
                int nowTime = 0;
                Task.Run(() =>
                {
                    while (time >= nowTime && TensionMode > 0)
                    {
                        if (time == nowTime)
                        {
                            _clients.All.SendAsync("LoadOffDelayOk", nowTime);
                            LoadOffDelayState = false;
                        }
                        else
                        {
                            _clients.All.SendAsync("LoadOffDelay", nowTime);

                        }
                        Thread.Sleep(1000);
                        if (!AutoStopState)
                        {
                            nowTime++;
                        }
                    }
                });
            }
        }
    }
    public class InPLC
    {
        public int Id { get; set; }
        public int Address { get; set; }
        public Boolean F05 { get; set; }
        public int F01 { get; set; }
        public int F06 { get; set; }
        public int F03 { get; set; }
        public int Mode { get; set; }
        public int[] F16 { get; set; }
    }
    public class SetDeviceParameterData
    {
        public int Address { get; set; }
        public int Mode { get; set; }
        public int[] Values { get; set; }
    }
    public class TensionModle
    {
        public int Mode { get; set; }
        public int A1 { get; set; }
        public int A2 { get; set; }
        public int B1 { get; set; }
        public int B2 { get; set; }
    }

}
