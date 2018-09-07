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
        public async Task<bool> F16Async(InPLC data)
        {

            var cancelTokenSource = new CancellationTokenSource(3000);
            bool b = false;
            await Task.Run(() =>
            {
                if (data.Id == 1)
                {
                    Z.F16(PLCSite.D(data.Address), data.F16, (r) => {
                        b = true;
                    });
                }
                else
                {
                    C.F16(PLCSite.D(data.Address), data.F16, (r) => {
                        b = true;
                    });
                }
                while (b || !cancelTokenSource.IsCancellationRequested)
                {
                    Thread.Sleep(10);
                }
            }, cancelTokenSource.Token);
            cancelTokenSource.Cancel();
            cancelTokenSource.Dispose();
            return b;
        }
        public async Task DF16Async(InPLC data)
        {
            var cancelTokenSource = new CancellationTokenSource(3000);
            int b = 1;
            int bb = 0;
            await Task.Run(() =>
            {
                if (TensionMode)
                {
                    b = 2;
                    C.F16(PLCSite.D(data.Address), data.F16, (r) => {
                        bb++;
                    });
                }
                Z.F16(PLCSite.D(data.Address), data.F16, (r) => {
                    bb++;
                });
                while (bb != b || !cancelTokenSource.IsCancellationRequested)
                {
                    Thread.Sleep(10);
                }
            }, cancelTokenSource.Token);
            cancelTokenSource.Cancel();
            cancelTokenSource.Dispose();
        }
    }
}
