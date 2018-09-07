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
        public async Task<GetDF03Return> DF03Async(InPLC data)
        {
            var cancelTokenSource = new CancellationTokenSource(3000);
            int b = 1;
            int bb = 0;
            List<int> z = null;
            List<int> c = null;
            if (ConnentState)
            {
                b = 2;
                C.F03(PLCSite.D(data.Address), data.F03, (rdata) =>
                {
                    c = ReceiveData.F03(rdata, data.F03);
                    bb++;
                });
            }
            Z.F03(PLCSite.D(data.Address), data.F03, (rdata) =>
            {
                z = ReceiveData.F03(rdata, data.F03);
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
            return new GetDF03Return() { B = b, BB = bb, Z = z, C = c };
        }

    }
    public class GetDF03Return
    {
        public int B { get; set; }
        public int BB { get; set; }
        public List<int> Z { get; set; }
        public List<int> C { get; set; }
    }
}
