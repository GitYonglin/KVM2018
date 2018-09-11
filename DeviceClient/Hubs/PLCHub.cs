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
    public partial class PLCHub : Hub
    {
        private static ModbusSocket Z = null;
        private static ModbusSocket C = null;
        private static IHubCallerClients _clients = null;
        private static bool TensionMode = false;
        private static bool TensionRun = false;

        private static bool ConnentState = false;

        public PLCHub()
        {
            TaskFactory tf = new TaskFactory();
            tf.StartNew(() => Console.WriteLine("重新请求连接" + Thread.CurrentThread.ManagedThreadId));
        }
        public void Init()
        {
            _clients = Clients;
        }
        /// <summary>
        /// 创建modbus连接
        /// </summary>
        /// <param name="connectState"></param>
        public void Creates(bool connectState)
        {
            ConnentState = connectState;
            if (Z == null)
            {
                Z = new ModbusSocket("192.168.181.101", 502, "主站", true);
                Z.ModbusLinkSuccess += ModbusLinkSuccess;
                Z.ModbusLinkError += ModbusLinkError;
            }
            try
            {
                if (C == null && ConnentState)
                {
                    C = new ModbusSocket("192.168.181.102", 502, "从站", false);
                    C.ModbusLinkSuccess += ModbusLinkSuccess;
                    C.ModbusLinkError += ModbusLinkError;
                }
                if (!ConnentState && C != null)
                {
                    C.Client.Close();
                    Task.Run(() =>
                    {
                        while (C != null)
                        {
                            if (!C.Client.Connected)
                            {
                                C.Client = null;
                                C = null;
                            }
                        }
                    });
                }
            }
            catch (Exception)
            {
                throw;
            }
            if (Z != null)
            {
                this.GetDeviceParameterAsync();
            }
        }
        /// <summary>
        /// 连接成功，启动心跳包连接
        /// </summary>
        /// <param name="id"></param>
        /// <param name="message"></param>
        public void ModbusLinkSuccess(string id, string message)
        {
            GetDeviceParameterAsync();
            var device = Z;
            if (id == "从站")
            {
                device = C;
            }
            // 心跳包保证链接
            Task.Run(() =>
            {
                while (device != null && device.Client != null && device.Client.Connected && device.IsSuccess)
                {
                    device.F05(PLCSite.M(0), true, null);
                    device.F03(PLCSite.D(0), 10, (data) => {
                        var rdata = ReceiveData.F03(data, 10);
                        _clients.All.SendAsync("LiveData", new { name = device.Name, data = rdata });
                    });
                    Thread.Sleep(300);
                }
            });
        }
        
        //public void F03(InPLC data)
        //{

        //    if (data.Id == 1)
        //    {
        //        Z.F03(PLCSite.D(data.Address), data.F03, (rdata) =>
        //        {
        //            _clients.All.SendAsync("F03Return", new { name = Z.Name, data = ReceiveData.F03(rdata, data.F03) });
        //        });
        //    }
        //    else
        //    {
        //        C.F03(PLCSite.D(data.Address), data.F03, (rdata) =>
        //        {
        //            _clients.All.SendAsync("F03Return", new { name = C.Name, data = ReceiveData.F03(rdata, data.F03) });
        //        });
        //    }
        //}
        //public async Task DF03Async(InPLC data)
        //{
        //    //Z.F03(PLCSite.D(data.Address), data.F03, (rdata) =>
        //    //{
        //    //    _clients.All.SendAsync("F03Return", new { name = Z.Name, data = ReceiveData.F03(rdata, data.F03) });
        //    //});
        //    //C.F03(PLCSite.D(data.Address), data.F03, (rdata) =>
        //    //{
        //    //    _clients.All.SendAsync("F03Return", new { name = C.Name, data = ReceiveData.F03(rdata, data.F03) });
        //    //});
        //    var cancelTokenSource = new CancellationTokenSource(3000);
        //    int b = 1;
        //    int bb = 0;
        //    List<int> z = null;
        //    List<int> c = null;
        //    await Task.Run(() =>
        //    {
        //        if (ConnentState)
        //        {
        //            b = 2;
        //            C.F03(PLCSite.D(500), 17, (rdata) =>
        //            {
        //                c = ReceiveData.F03(rdata, 17);
        //                bb++;
        //            });
        //        }
        //        Z.F03(PLCSite.D(500), 17, (rdata) =>
        //        {
        //            z = ReceiveData.F03(rdata, 17);
        //            bb++;
        //        });
        //        while (bb != b || !cancelTokenSource.IsCancellationRequested)
        //        {
        //            Thread.Sleep(10);
        //        }
        //    });
        //    cancelTokenSource.Cancel();
        //}
        //public void F05(InPLC data)
        //{

        //    if (data.Id == 1)
        //    {
        //        Z.F05(data.Address, data.F05, null);
        //    }
        //    else
        //    {
        //        C.F05(data.Address, data.F05, null);
        //    }
        //}
        //public Boolean DF05(InPLC data)
        //{
        //    Z.F05(PLCSite.M(data.Address), data.F05, null);
        //    if (ConnentState && C != null)
        //    {
        //        C.F05(PLCSite.M(data.Address), data.F05, null);
        //    }
        //    return true;
        //}

        public async Task<bool> F06Async(InPLC data)
        {
            var cancelTokenSource = new CancellationTokenSource(3000);
            bool b = false;
            await Task.Run(() =>
            {
                if (data.Id == 1)
                {
                    Z.F06(PLCSite.D(data.Address), data.F06, (r) =>
                    {
                        b = true;
                    });
                }
                else
                {
                    C.F06(PLCSite.D(data.Address), data.F06, (r) =>
                    {
                        b = true;
                    });
                }
                while (!b || !cancelTokenSource.IsCancellationRequested )
                {
                    Thread.Sleep(10);
                }
            });
            cancelTokenSource.Cancel();
            return b;
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
        //public bool F16(InPLC data)
        //{
        //    if (data.Id == 1)
        //    {
        //        Z.F16(PLCSite.D(data.Address), data.F16, null);
        //    }
        //    else
        //    {
        //        C.F16(PLCSite.D(data.Address), data.F16, null);
        //    }
        //    return true;
        //}
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
        //public Boolean AutoF05(InPLC data)
        //{
        //    if (TensionMode == -1)
        //    {
        //        TensionMode = data.Mode;

        //    }
        //    Console.WriteLine("张拉启动");
        //    Console.WriteLine(TensionMode);
        //    if (TensionMode == 1 || TensionMode == 3 || TensionMode == 4)
        //    {
        //        C.F05(PLCSite.M(data.Address), data.F05, null);
        //    }

        //    Z.F05(PLCSite.M(data.Address), data.F05, null);
        //    LoadOffDelayState = false;
        //    DelayState = false;
        //    AutoStopRunState = false;
        //    ZAutoStopState = false;
        //    CAutoStopState = false;
        //    AutoStopState = false;
        //    ZAutoStopState = false;
        //    CAutoStopState = false;
        //    return true;
        //}


        public async Task<bool> AutoStartAsync()
        {
            var b = await DF05Async(new InPLC() { Address = 520, F05 = true });
            TensionRun = true;
            return b;
        }
        /// <summary>
        /// 张拉完成
        /// </summary>
        /// <returns></returns>
        public async Task AutoDoneAsync()
        {
            await DF05Async(new InPLC() { Address = 522, F05 = true });
            TensionRun = false;
            TensionMode = false;
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
            }
        }

        /// <summary>
        /// 阶段压力数据上载到PLC
        /// </summary>
        /// <param name="t"></param>
        public async Task<bool> UpMpaAsync(MpaUP t)
        {
            TensionMode = t.Mode == 1 || t.Mode == 3 || t.Mode == 4 ? true : false;
            var cancelTokenSource = new CancellationTokenSource(3000);
            int b = 1;
            int bb = 0;
            if (TensionMode)
            {
                b = 2;
                C.F16(PLCSite.D(t.Address), new int[] { t.A2, t.B2 }, (r) => {
                    bb++;
                });
            }
            Z.F16(PLCSite.D(t.Address), new int[] { t.A1, t.B1 }, (r) => {
                bb++;
            });
            await Task.Run(() =>
            {
                while (bb != b || !cancelTokenSource.IsCancellationRequested)
                {
                }
            }, cancelTokenSource.Token);
            cancelTokenSource.Cancel();
            cancelTokenSource.Dispose();
            return bb == b;
        }

        /// <summary>
        /// 卸荷
        /// </summary>
        /// <param name="data"></param>
        public async Task<bool> LoadOffAsync(MpaUP t)
        {
            var b = await UpMpaAsync(t);
            if (b)
            {
                var bb = await DF05Async(new InPLC() { Address = 521, F05 = true });
                return bb;
            } else
            {
                return b;
            }

        }
        /// <summary>
        /// 张拉平衡
        /// </summary>
        /// <param name="t"></param>
        public object Balance(MpaUP t)
        {
            if (TensionMode)
            {
                C.F16(PLCSite.D(t.Address), new int[] { t.A2, t.B2 }, null);
            }
            Z.F16(PLCSite.D(t.Address), new int[] { t.A1, t.B1 }, null);
            return t;
        }

        /// <summary>
        /// 确认压力数据下载
        /// </summary>
        /// <param name="t"></param>
        public bool AffirmMpa(MpaUP t)
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
        /// <summary>
        /// 确认压力数据下载
        /// </summary>
        /// <param name="t"></param>
        public object AffirmMpaDone(InPLC data)
        {
            if (data.Id == 1)
            {
                Z.F06(PLCSite.D(data.Address), data.F06, null);
            }
            else
            {
                C.F06(PLCSite.D(data.Address), data.F06, null);
            }
            return data;
        }
        /// <summary>
        /// 倒顶回程位移设置
        /// </summary>
        /// <param name="data"></param>
        public void GoBack(InPLC data)
        {
            Z.F16(PLCSite.D(406), new int[] { data.F06 }, null);
            if (TensionMode)
            {
                C.F16(PLCSite.D(406), new int[] { data.F06 }, null);
            }
            Z.F05(PLCSite.M(560), true, null);
            if (TensionMode)
            {
                C.F05(PLCSite.M(560), true, null);
            }
        }
        /// <summary>
        /// 张拉暂停
        /// </summary>
        /// <returns></returns>
        public Boolean Pause()
        {
            Z.F05(PLCSite.M(550), true, null);
            if (TensionMode)
            {
                C.F05(PLCSite.M(550), true, null);
            }
            return true;
        }
        /// <summary>
        /// 暂停继续运行
        /// </summary>
        /// <returns></returns>
        public async Task<bool> PauseRunAsync()
        {
            var b = await DF05Async(new InPLC() { Address = 550, F05 = false });
            return b;
        }
    }
}
