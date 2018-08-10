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
        private static bool LoadOffDelayState = false;
        private static bool DelayState = false;

        public PLCHub()
        {
            TaskFactory tf = new TaskFactory();
            tf.StartNew(() => Console.WriteLine(Thread.CurrentThread.ManagedThreadId));

            if (Z == null)
            {
                Z = new ModbusSocket("192.168.181.101", 502, "主站", true);
                Z.ModbusLinkSuccess += ModbusLinkSuccess;
                Z.ModbusLinkError += ModbusLinkError;
            }
            if (C == null)
            {
                C = new ModbusSocket("192.168.181.102", 502, "从站", false);
                C.ModbusLinkSuccess += ModbusLinkSuccess;
                C.ModbusLinkError += ModbusLinkError;
            }
        }
        public void Init()
        {
            _clients = Clients;
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
        /// <summary>
        /// 自动张拉F05
        /// </summary>
        /// <param name="mode"></param>
        /// <returns></returns>
        public Boolean AutoF05(InPLC data)
        {
            switch (data.Mode)
            {
                case 1:
                case 3:
                case 4:
                    C.F05(PLCSite.M(data.Address), data.F05, null);
                    break;
                default:
                    break;
            }
            Z.F05(PLCSite.M(data.Address), data.F05, null);
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
        /// 通信状态事件
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
        /// 心跳连接
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
            //GetDeviceParameter(device);
            // 心跳包保证链接
            Task.Run(() =>
            {
                while (device.Client != null && device.Client.Connected && device.IsSuccess)
                {
                    device.F05(PLCSite.M(0), true, null);
                    device.F03(PLCSite.D(0), 8, (data) =>
                    {
                        _clients.All.SendAsync("LiveData", new { name = device.Name, data = ReceiveData.F03(data, 8) });
                    });
                    Thread.Sleep(10);
                }
            });
            //if (_clients != null)
            //{
            //  _clients.All.SendAsync("Send", new { Id = id, Message = message });
            //}
        }
        public void Tension(TensionModle t)
        {
            if (t.Mode == 0 || t.Mode == 1)
            {
                Z.F06(PLCSite.D(410), t.A1, null);
            }
            if (t.Mode == 2 || t.Mode == 3)
            {
                Z.F06(PLCSite.D(411), t.B1, null);
            }
            if (t.Mode == 1)
            {
                C.F06(PLCSite.D(410), t.A2, null);
            }
            if (t.Mode == 3)
            {
                C.F06(PLCSite.D(411), t.B2, null);
            }
            if (t.Mode == 4)
            {
                Z.F16(PLCSite.D(410), new int[] { t.A1, t.B1 }, null);
                C.F16(PLCSite.D(410), new int[] { t.A2, t.B2 }, null);
            }
        }
        /// <summary>
        /// 获取设备参数
        /// </summary>
        public void GetDeviceParameter()
        {
            ModbusSocket device = Z;
            device.F03(PLCSite.D(500), 17, (data) =>
            {
                _clients.All.SendAsync("DeviceParameter", new { name = device.Name, data = ReceiveData.F03(data, 17) });
            });
        }

        public Boolean SetDeviceParameter(SetDeviceParameterData data)
        {
            try
            {
                Z.F06(PLCSite.D(data.Address), data.Value, null);
                C.F06(PLCSite.D(data.Address), data.Value, null);
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
                    while (time >= nowTime)
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
                        nowTime++;
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
                    while (time >= nowTime)
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
                        nowTime++;
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
    }
    public class SetDeviceParameterData
    {
        public int Address { get; set; }
        public int Value { get; set; }
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
