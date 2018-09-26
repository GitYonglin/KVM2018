using Microsoft.AspNetCore.SignalR;
using Modbus.ASCII;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DeviceClient.Hubs
{
    public partial class PLCHub
    {
        /// <summary>
        /// 获取设备参数
        /// </summary>
        private async Task GetDeviceParameterAsync()
        {
            var r = await DF03Async(new InPLC() { Address = 500, F03 = 17 });
            await _clients.All.SendAsync("DeviceParameter", r);

        }
        /// <summary>
        /// 设置设备参数
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public async Task SetDeviceParameterAsync(InPLC data)
        {
            var cancelTokenSource = new CancellationTokenSource(3000);
            int b = 1;
            int bb = 0;
            await Task.Run(() =>
            {
                if (ConnentState)
                {
                    b = 2;
                    C.F16(1, PLCSite.D(data.Address), data.F16, (r) =>
                    {
                        bb++;
                    });
                }
                Z.F16(1, PLCSite.D(data.Address), data.F16, (r) =>
                {
                    bb++;
                });
                while (bb != b || !cancelTokenSource.IsCancellationRequested)
                {
                    Thread.Sleep(10);
                }
            },cancelTokenSource.Token);
            cancelTokenSource.Cancel();
            cancelTokenSource.Dispose();
            await GetDeviceParameterAsync();
        }

    }
}
