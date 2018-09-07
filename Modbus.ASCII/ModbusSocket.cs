using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Modbus.ASCII
{
    /// <summary>
    /// 状态回调委托
    /// </summary>
    /// <param name="str">返回信息</param>
    public delegate void EventDL(string id, string message);
    /// <summary>
    /// Modbus返回数据处理委托
    /// </summary>
    /// <param name="str">返回数据字符串</param>
    /// <returns></returns>
    public delegate object ReceiveDL(byte[] data);
    public delegate void ReturnReceive(byte[] o);


    public class ModbusSocket
    {
        public byte[] ReviceByte = new byte[1024];
        /// <summary>
        /// 保持通信请求数据状态
        /// </summary>
        public Boolean InitState { get; set; }
        /// <summary>
        /// 临时测试保持通信
        /// </summary>
        public Boolean State { get; set; }
        /// <summary>
        /// Modbus实例
        /// </summary>
        public Socket Client;
        public NetworkStream stream;
        /// <summary>
        /// Modbus实例状态 True实例通信正常
        /// </summary>
        public Boolean IsSuccess { get; set; } = false;
        /// <summary>
        /// Modbus Ip
        /// </summary>
        public string Ip { get; }
        /// <summary>
        /// 端口
        /// </summary>
        public int Port { get; }
        /// <summary>
        /// 名称
        /// </summary>
        public string Name { get; }
        /// <summary>
        /// 设备链接成功回调事件
        /// </summary>
        public event EventDL ModbusLinkSuccess;
        /// <summary>
        /// 设备链接失败回调事件
        /// </summary>
        public event EventDL ModbusLinkError;
        /// <summary>
        /// 请求数据队列
        /// </summary>
        public List<ListSendData> listSands = new List<ListSendData>();
        public string socketId { get; set; }
        private Boolean ReviceState { get; set; } = true;


        /// <summary>
        /// 创建Modbus实例构造函数
        /// </summary>
        /// <param name="Ip">Modbus Ip</param>
        /// <param name="Port">端口号</param>
        /// <param name="Name">名称</param>
        public ModbusSocket(string Ip, int Port, string Name, Boolean initState)
        {
            this.Ip = Ip;
            this.Port = Port;
            this.Name = Name;
            this.InitState = initState;
            Link();

            Task.Run(() =>
            {
                while (true)
                {
                    if (!IsSuccess)
                    {
                        Console.WriteLine(this.Ip);
                        Client?.Close();
                        Client = null;
                        ModbusLinkError?.Invoke(this.Name, $"{Name}--3秒钟后重新链接");
                        Thread.Sleep(3000);
                        ModbusLinkError?.Invoke(this.Name, $"{Name}--重新链接...");
                        Link();
                    }
                    else
                    {
                        if (listSands.Count > 0)
                        {
                            var item = listSands?[0];
                            if (item != null)
                            {
                                //ModbusLink(this.Name, $"{Name}--{item.CommandData.Str}--{listSands.Count}--{socketId}");
                                Send(item.CommandData.Bytes, item.RR);
                                listSands.Remove(item);
                            }
                        }
                    }
                }
            });
        }
        /// <summary>
        /// 保持通信请求
        /// </summary>
        private void Finit()
        {
            ModbusLinkSuccess?.Invoke(this.Name, $"{Name}链接中");
            F05(PLCSite.M(0), true, null);
        }
        public void F01(int address, int data, ReturnReceive callback)
        {
            CommandData command = CommandCode.F01(address, data);
            AddListSand(new ListSendData { CommandData = command, RR = callback });
        }
        public void F03(int address, int data, ReturnReceive callback)
        {
            CommandData command = CommandCode.F03(address, data);
            AddListSand(new ListSendData { CommandData = command, RR = callback });
        }
        /// <summary>
        /// 设置单个线圈 功能码=F05
        /// </summary>
        /// <param name="address">设置线圈地址</param>
        /// <param name="data">设置线圈状态 true通，false断</param>
        /// <returns>返回 IsSuccess：请求结果True=成功，Message：信息，Data.Data：返回数据</returns>
        public void F05(int address, Boolean data, ReturnReceive callback)
        {
            CommandData command = CommandCode.F05(address, data);
            AddListSand(new ListSendData { CommandData = command, RR = callback });
            //Send(command, callback);
            //return receive == null ? false : ReceiveData.F05(receive);
        }
        public void F06(int address, int data, ReturnReceive callback)
        {
            CommandData command = CommandCode.F06(address, data);
            AddListSand(new ListSendData { CommandData = command, RR = callback });
        }
        public void F16(int address, int[] data, ReturnReceive callback)
        {
            CommandData command = CommandCode.F16(address, data);
            AddListSand(new ListSendData { CommandData = command, RR = callback });
        }
        /// <summary>
        /// 执行Modbus请求&回去返回数据
        /// </summary>
        /// <param name="bs">Modbus命令</param>
        /// <param name="receiveDL">处理返回数据方法</param>
        /// <returns>返回操作结果数据</returns>
        public void Send(byte[] bs, ReturnReceive returnReceive)
        {
            if (Client != null && Client.Connected && IsSuccess)
            {
                //new Thread(async () =>
                //{
                try
                {
                    Client.Send(bs);
                    Client.Receive(ReviceByte);
                    returnReceive?.Invoke(ReviceByte);
                }
                catch (SocketException ex)
                {
                    IsSuccess = false;
                    ModbusLinkError?.Invoke(this.Name, $"{Name}请求错误--{ex.Message}");
                }
                //}).Start();
            }
            else
            {
                if (Client == null || !Client.Connected)
                {
                    IsSuccess = false;
                }
            }
        }
        /// <summary>
        /// 创建Socket
        /// </summary>
        public void Link()
        {
            if (!IsSuccess)
            {
                IsSuccess = true;
                Client = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
                Client.BeginConnect(Ip, Port, AsyncCallback, null);
                //Client.BeginConnect(Ip, Port, AsyncCallback, null);
                Client.ReceiveBufferSize = 1024;
                Client.ReceiveTimeout = 3000;
                Client.SendTimeout = 3000;
            }
        }
        /// <summary>
        /// 创建Socket结果回调
        /// </summary>
        /// <param name="ar"></param>
        void AsyncCallback(IAsyncResult ar)
        {
            if (Client != null && Client.Connected)
            {
                IsSuccess = true;
                listSands.Clear();
                socketId = DateTime.Now.ToString();
                ModbusLinkSuccess?.Invoke(this.Name, $"{Name}链接成功");
            }
            else
            {
                IsSuccess = false;
            }
        }
        void ReviceCallback(IAsyncResult ar)
        {
            Console.WriteLine(ar);
        }
        void AddListSand(ListSendData ls)
        {
            var ll = listSands?.Find(l => l?.CommandData.Str == ls.CommandData.Str);
            if (ll == null)
            {
                listSands.Add(ls);
            }
        }
    }
    public class CallbackData
    {
        public byte[] Bytes { get; set; }
        public string Message { get; set; }
    }
    /// <summary>
    /// 请求队列
    /// </summary>
    public class ListSendData
    {
        /// <summary>
        /// 回调
        /// </summary>
        public ReturnReceive RR { get; set; }
        /// <summary>
        /// 处理modbus返回数据方法
        /// </summary>
        //public ReceiveDL RDL { get; set; }
        /// <summary>
        /// modbus请求数据
        /// </summary>
        public CommandData CommandData { get; set; }
    }
}
