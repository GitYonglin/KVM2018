using MODBUS;
using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace MODBUSSocket
{
    public class SocketLink
    {
        public Socket Client = null;
        public string Ip { get; set; }
        public int Port { get; set; }

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


        public SocketLink(string Ip, int Port)
        {
            this.Ip = Ip;
            this.Port = Port;
            Link();
        }
        private void Link()
        {
            if (Client != null)
            {
                Client.Close();
                Client.Dispose();
                Client = null;
                LinkStateE.Invoke(false, "三秒重新连接");
                Thread.Sleep(3000);
                LinkStateE.Invoke(false, $"重新链接{linkNumber}次");
            }
            Client = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp)
            {
                ReceiveBufferSize = 1024,
                ReceiveTimeout = 3000,
                SendTimeout = 3000
            };
            Client.BeginConnect(Ip, Port, LinkState, null);
        }
        private void LinkState(IAsyncResult ar)
        {
            if (Client.Connected)
            {
                Client.BeginReceive(ReviceByte, 0, ReviceByte.Length, SocketFlags.None, (IAsyncResult a) => {
                    LinkStateE?.Invoke(true, "连接成功");
                }, null);

            } else
            {
                LinkStateE.Invoke(false, "连接错误");
                if (linkNumber > 3)
                {
                    Link();
                    linkNumber++;
                } else
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
        protected void Send(SendData sd, Receive callback)
        {
            try
            {
                Client.Send(sd.Bytes);
                if (callback != null)
                {
                    Client.Receive(ReviceByte);
                    callback?.Invoke(Encoding.ASCII.GetString(ReviceByte).Split('\n')[0]);

                    //SC.Client.BeginReceive(ReviceByte, 0, ReviceByte.Length, SocketFlags.None, (IAsyncResult ar) => {
                    //}, null);
                }
                var item = listSands?[0];
                if (item != null)
                {
                    Send(item.SendData, item.Receive);
                    listSands.Remove(item);
                }
            }
            catch (Exception)
            {
                LinkStateE.Invoke(false, "请求错误");
                ManualLink();
            }
        }
        protected void AddListSand(ListSendData ls)
        {
            var ll = listSands?.Find(l => l?.SendData.Str == ls.SendData.Str);
            if (ll == null)
            {
                listSands.Add(ls);
            }
        }
    }
}
