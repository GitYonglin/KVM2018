using Microsoft.AspNetCore.SignalR;
using MODBUS.ASCII;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DeviceClient.Hubs
{

    public class DVP : Hub
    {
        private static ASCIIClient MS = null;
        private static IHubCallerClients _clients = null;
        private static bool TensionMode = false;
        private static bool TensionRun = false;
        /// <summary>
        /// 单击联机
        /// </summary>
        private static bool ConnentState = false;

        public void Init()
        {
            _clients = Clients;
        }
        /// <summary>
        /// 创建modbus连接
        /// </summary>
        /// <param name="connectState">单击联机</param>
        public void Creates(bool connectState)
        {
            ConnentState = connectState;
            if (MS == null)
            {
                _clients.All.SendAsync("Send", new { State = false, Message = "正在连接..." });
                MS = new ASCIIClient("192.168.1.1", 8887);
                MS.LinkStateE += (state, msg) => {
                    _clients.All.SendAsync("Send", new { State = state, Message = msg });
                    if (state)
                    {
                        StartKeepAlive();
                    }
                };
            }
            else
            {
                //this.GetDeviceParameterAsync();
                if (MS.Client != null && !MS.Client.Connected)
                {
                    if (MS.linkNumber < 3)
                    {
                        _clients.All.SendAsync("Send", new { State = false, Message = $"重新链接{MS.linkNumber + 1}次" });
                    } else
                    {
                        _clients.All.SendAsync("Send", new { State = false, Message = $"尝试过多，请手动连接" });
                    }
                } else
                {
                    _clients.All.SendAsync("Send", new { State = true, Message = "链接成功" });
                    StartKeepAlive();
                }
            }
        }
        public void Retry()
        {
            MS.ManualLink();
        }
        /// <summary>
        /// 连接成功，启动心跳包连接
        /// </summary>
        /// <param name="id"></param>
        /// <param name="message"></param>
        public void StartKeepAlive()
        {
            //GetDeviceParameterAsync();
            // 心跳包保证链接
            Task.Run(() =>
            {
                while (MS != null && MS.Client.Connected)
                {
                    KeepAlive(1);
                    if (ConnentState)
                    {
                        KeepAlive(2);
                    }
                    Thread.Sleep(100);
                }
            });
        }
        private void KeepAlive(int ipAddress)
        {
            MS.F05(ipAddress, MODBUS.DVP.M(0), true, null);
            MS.F03(ipAddress, MODBUS.DVP.D(0), 10, (data) =>
            {
                var rdata = ASCIIReceive.F03(data, 10);
                _clients.All.SendAsync("LiveData", new { id = ipAddress, data = rdata });
            });
        }
        //public async Task<bool> F06Async(InPLC data)
        //{
        //    var cancelTokenSource = new CancellationTokenSource(3000);
        //    bool b = false;
        //    await Task.Run(() =>
        //    {
        //        if (data.Id == 1)
        //        {
        //            Z.F06(1, PLCSite.D(data.Address), data.F06, (r) =>
        //            {
        //                b = true;
        //            });
        //        }
        //        else
        //        {
        //            C.F06(1, PLCSite.D(data.Address), data.F06, (r) =>
        //            {
        //                b = true;
        //            });
        //        }
        //        while (!b || !cancelTokenSource.IsCancellationRequested)
        //        {
        //            Thread.Sleep(10);
        //        }
        //    }, cancelTokenSource.Token);
        //    cancelTokenSource.Cancel();
        //    return b;
        //}
        //public void F06(InPLC data)
        //{

        //    if (data.Id == 1)
        //    {
        //        Z.F06(1, PLCSite.D(data.Address), data.F06, null);
        //    }
        //    else
        //    {
        //        C.F06(1, PLCSite.D(data.Address), data.F06, null);
        //    }
        //}

        //public void F01(InPLC data)
        //{
        //    if (data.Id == 1)
        //    {
        //        Z.F01(1, data.Address, data.F01, (rData) =>
        //        {
        //            _clients.All.SendAsync("noe", rData);
        //        });
        //    }
        //    else
        //    {
        //        C.F01(1, data.Address, data.F01, (rData) =>
        //        {
        //            _clients.All.SendAsync("noe", rData);
        //        });
        //    }
        //}

        //public async Task<bool> AutoStartAsync()
        //{
        //    var b = await DF05Async(new InPLC() { Address = 520, F05 = true });
        //    TensionRun = true;
        //    return b;
        //}
        ///// <summary>
        ///// 张拉完成
        ///// </summary>
        ///// <returns></returns>
        //public async Task AutoDoneAsync()
        //{
        //    await DF05Async(new InPLC() { Address = 522, F05 = true });
        //    TensionRun = false;
        //    TensionMode = false;
        //}


        ///// <summary>
        ///// 阶段压力数据上载到PLC
        ///// </summary>
        ///// <param name="t"></param>
        //public async Task<bool> UpMpaAsync(MpaUP t)
        //{
        //    TensionMode = t.Mode == 1 || t.Mode == 3 || t.Mode == 4 ? true : false;
        //    var cancelTokenSource = new CancellationTokenSource(3000);
        //    int b = 1;
        //    int bb = 0;
        //    if (TensionMode)
        //    {
        //        b = 2;
        //        C.F16(1, PLCSite.D(t.Address), new int[] { t.A2, t.B2 }, (r) =>
        //        {
        //            bb++;
        //        });
        //    }
        //    Z.F16(1, PLCSite.D(t.Address), new int[] { t.A1, t.B1 }, (r) =>
        //    {
        //        bb++;
        //    });
        //    await Task.Run(() =>
        //    {
        //        while (bb != b || !cancelTokenSource.IsCancellationRequested)
        //        {
        //        }
        //    }, cancelTokenSource.Token);
        //    cancelTokenSource.Cancel();
        //    cancelTokenSource.Dispose();
        //    return bb == b;
        //}

        ///// <summary>
        ///// 卸荷
        ///// </summary>
        ///// <param name="data"></param>
        //public async Task<bool> LoadOffAsync(MpaUP t)
        //{
        //    var b = await UpMpaAsync(t);
        //    if (b)
        //    {
        //        var bb = await DF05Async(new InPLC() { Address = 521, F05 = true });
        //        return bb;
        //    }
        //    else
        //    {
        //        return b;
        //    }

        //}
        ///// <summary>
        ///// 张拉平衡
        ///// </summary>
        ///// <param name="t"></param>
        //public object Balance(MpaUP t)
        //{
        //    if (TensionMode)
        //    {
        //        C.F16(1, PLCSite.D(t.Address), new int[] { t.A2, t.B2 }, null);
        //    }
        //    Z.F16(1, PLCSite.D(t.Address), new int[] { t.A1, t.B1 }, null);
        //    return t;
        //}

        ///// <summary>
        ///// 确认压力数据下载
        ///// </summary>
        ///// <param name="t"></param>
        //public bool AffirmMpa(MpaUP t)
        //{
        //    if (t.Mode == 0 || t.Mode == 2)
        //    {
        //        Z.F16(1, PLCSite.D(414), new int[] { t.A1, t.B1 }, null);
        //    }
        //    else
        //    {
        //        Z.F16(1, PLCSite.D(414), new int[] { t.A1, t.B1 }, null);
        //        C.F16(1, PLCSite.D(414), new int[] { t.A2, t.B2 }, null);
        //    }
        //    return true;
        //}
        ///// <summary>
        ///// 确认压力数据下载
        ///// </summary>
        ///// <param name="t"></param>
        //public object AffirmMpaDone(InPLC data)
        //{
        //    if (data.Id == 1)
        //    {
        //        Z.F06(1, PLCSite.D(data.Address), data.F06, null);
        //    }
        //    else
        //    {
        //        C.F06(1, PLCSite.D(data.Address), data.F06, null);
        //    }
        //    return data;
        //}
        ///// <summary>
        ///// 倒顶回程位移设置
        ///// </summary>
        ///// <param name="data"></param>
        //public void GoBack(InPLC data)
        //{
        //    Z.F16(1, PLCSite.D(406), new int[] { data.F06 }, null);
        //    if (TensionMode)
        //    {
        //        C.F16(1, PLCSite.D(406), new int[] { data.F06 }, null);
        //    }
        //    Z.F05(1, PLCSite.M(560), true, null);
        //    if (TensionMode)
        //    {
        //        C.F05(1, PLCSite.M(560), true, null);
        //    }
        //}
        ///// <summary>
        ///// 张拉暂停
        ///// </summary>
        ///// <returns></returns>
        //public Boolean Pause()
        //{
        //    Z.F05(1, PLCSite.M(550), true, null);
        //    if (TensionMode)
        //    {
        //        C.F05(1, PLCSite.M(550), true, null);
        //    }
        //    return true;
        //}
        ///// <summary>
        ///// 暂停继续运行
        ///// </summary>
        ///// <returns></returns>
        //public async Task<bool> PauseRunAsync()
        //{
        //    var b = await DF05Async(new InPLC() { Address = 550, F05 = false });
        //    return b;
        //}
    }

}
