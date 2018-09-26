using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MODBUS
{
    public class SocketLink
    {
        public Socket Client = null;
        public string Ip { get; set; }
        public int Port { get; set; }
        private bool SendState = false;

        /// <summary>
        /// 成功连接回调
        /// </summary>
        public event Action<bool, string> LinkStateE;
        /// <summary>
        /// 链接次数
        /// </summary>
        public int linkNumber = 0;
        /// <summary>
        /// 返回数据流
        /// </summary>
        public byte[] ReviceByte = new byte[1024];
        /// <summary>
        /// 请求数据队列
        /// </summary>
        public List<ListSendData> listSands = new List<ListSendData>();
        Stopwatch watch = new Stopwatch();


        public SocketLink(string Ip, int Port)
        {
            this.Ip = Ip;
            this.Port = Port;
            Link();
        }
        private void Link()
        {
            if (Client != null && !Client.Connected)
            {
                Client.Close();
                //Client.Dispose();
                Client = null;
                LinkStateE.Invoke(false, "3秒重新连接");
                Thread.Sleep(3000);
                LinkStateE.Invoke(false, $"重新链接{linkNumber + 1}次");
            }
            if (Client == null)
            {
                Client = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp)
                {
                    ReceiveBufferSize = 1024,
                    ReceiveTimeout = 3000,
                    SendTimeout = 3000
                };
                Client.BeginConnect(Ip, Port, LinkState, null);
            }
            else
            {
                LinkStateE?.Invoke(true, "连接成功");
            }
        }
        private void LinkState(IAsyncResult ar)
        {

            if (Client.Connected)
            {
                LinkStateE?.Invoke(true, "连接成功");
                //Client.BeginReceive(ReviceByte, 0, ReviceByte.Length, SocketFlags.None, (IAsyncResult rrr) =>
                //{
                //}, null);
            }
            else
            {
                LinkStateE.Invoke(false, "连接错误");
                if (linkNumber < 3)
                {
                    Link();
                    linkNumber++;
                }
                else
                {
                    LinkStateE.Invoke(false, "尝试过多，请手动连接");
                }
            }
        }
        public void ManualLink()
        {
            linkNumber = 0;
            Link();
        }
        /// <summary>
        /// 发送命令请求
        /// </summary>
        /// <param name="sd">发送的命令</param>
        /// <param name="callback">请求成功的回调</param>
        protected void Send()
        {

                foreach (var item in listSands)
                {
                    watch.Reset();
                    watch.Start();
                    Thread.Sleep(200);
 
                    //listSands.Remove(item);

                    //Client.Send(item.SendData.Bytes);
                    //var i = Client.Receive(ReviceByte);
                    //item.Receive?.Invoke(Encoding.ASCII.GetString(ReviceByte, 0, i).Split('\n')[0]);

                    //Console.WriteLine(listSands.Count);
                    //if (listSands.Count == 0)
                    //{
                    //    SendState = false;
                    //}
                    watch.Stop();
                    var t = watch.ElapsedMilliseconds.ToString();
                    Console.WriteLine($"用时{t}");

                }
            try
            {
            }
            catch (Exception)
            {
                LinkStateE.Invoke(false, "请求错误");
                Client.Close();
                //Client.Dispose();
                Client = null;
                listSands.Clear();
                ManualLink();
                return;
            }

        }
        protected void AddListSand(ListSendData ls)
        {
            Task.Run(() =>
            {
                var ll = listSands?.Find(l => l?.SendData.Str == ls.SendData.Str);
                if (ll == null && Client != null && Client.Connected)
                {
                    listSands.Add(ls);
                    if (!SendState)
                    {
                        SendState = true;
                        Console.WriteLine("12222222222");
                        Send();
                    }
                }
            });
        }
    }
}
