using MODBUS.ASCII;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ConsoleApp1
{
    class Program
    {
        private static ASCIIClient MS = null;
        private static bool TensionMode = false;
        private static bool TensionRun = false;
        /// <summary>
        /// 单击联机
        /// </summary>
        private static bool ConnentState = false;
        static void Main(string[] args)
        {
            Console.WriteLine("Hello World!");
            Creates(false);
            Console.ReadLine();
            Operation();
        }

        /// <summary>
        /// 创建modbus连接
        /// </summary>
        /// <param name="connectState">单击联机</param>
        public static void Creates(bool connectState)
        {
            ConnentState = connectState;
            if (MS == null)
            {
                Console.WriteLine("正在链接。。");
                MS = new ASCIIClient("192.168.1.1", 8887);
                MS.LinkStateE += (state, msg) => {
                    Console.WriteLine(msg);
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
                        Console.WriteLine($"重新链接{MS.linkNumber + 1}次");
                    }
                    else
                    {
                        Console.WriteLine($"尝试过多，请手动连接");
                    }
                }
                if (MS.Client != null && MS.Client.Connected)
                {
                    Console.WriteLine($"链接成功");
                    StartKeepAlive();
                }
            }
        }
        public static void Retry()
        {
            MS.ManualLink();
        }
        /// <summary>
        /// 连接成功，启动心跳包连接
        /// </summary>
        /// <param name="id"></param>
        /// <param name="message"></param>
        public static void StartKeepAlive()
        {
            //GetDeviceParameterAsync();
            // 心跳包保证链接
            Task.Run(() =>
            {
                while (MS != null && MS.Client != null && MS.Client.Connected)
                {
                    KeepAlive(1);
                    KeepAlive(2);
                    //if (ConnentState)
                    //{
                    //}
                    //Thread.Sleep(10);
                    
                }
            });
            Task.Run(() =>
            {
                while (MS != null && MS.Client != null && MS.Client.Connected)
                {
                Thread.Sleep(3000);
                MS.F05(1, MODBUS.DVP.Y(0), true, null);
                Thread.Sleep(3000);
                MS.F05(1, MODBUS.DVP.Y(0), false, null);
                }
            });
        }
        private static void KeepAlive(int ipAddress)
        {
            MS.F05(ipAddress, MODBUS.DVP.M(0), true, null);
            MS.F03(ipAddress, MODBUS.DVP.D(0), 10, (data) =>
            {
                var rdata = ASCIIReceive.F03(data, 10);
                //_clients.All.SendAsync("LiveData", new { id = ipAddress, data = rdata });
                Console.WriteLine($"id={ipAddress}---{data}");
            });
        }


        static void Operation()
        {
            while (true)
            {
                var r = Console.ReadLine();
                Console.WriteLine(r);
                if (r == "1")
                {
                    MS.F05(1, MODBUS.DVP.Y(0), true, null);
                }
                else if (r == "2")
                {
                    MS.F05(2, MODBUS.DVP.Y(0), true, null);

                }
                else if (r == "4")
                {
                    MS.F05(2, MODBUS.DVP.Y(0), false, null);
                }
                else if (r == "3")
                {
                    MS.F05(1, MODBUS.DVP.Y(0), false, null);
                }
                else if (r == "5")
                {
                    //Client.Receive(bs);
                    //RequsertStr();
                }

            }
        }

    }
}
