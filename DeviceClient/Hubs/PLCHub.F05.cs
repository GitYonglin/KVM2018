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
        public void F05(InPLC data)
        {

            if (data.Id == 1)
            {
                Z.F05(1, data.Address, data.F05, null);
            }
            else
            {
                C.F05(1, data.Address, data.F05, null);
            }
        }
        public Boolean DF05(InPLC data)
        {
            Z.F05(1, PLCSite.M(data.Address), data.F05, null);
            if (C != null)
            {
                C.F05(1, PLCSite.M(data.Address), data.F05, null);
            }
            return true;
        }
        public async Task<bool> DF05Async(InPLC data)
        {
            var cancelTokenSource = new CancellationTokenSource(3000);
            int b = 1;
            int bb = 0;
            if (TensionMode)
            {
                b = 2;
                C.F05(1, PLCSite.M(data.Address), data.F05, (rdata) =>
                {
                    bb++;
                });
                }
            Z.F05(1, PLCSite.M(data.Address), data.F05, (rdata) =>
            {
                bb++;
            });
            await Task.Run(() =>
            {
                while (bb != b || !cancelTokenSource.IsCancellationRequested)
                {}
            }, cancelTokenSource.Token);
            cancelTokenSource.Cancel();
            cancelTokenSource.Dispose();
            return bb == b;
        }
    }
}
