using System;
using System.Collections.Generic;
using System.Text;

namespace MODBUS
{
    public delegate void Receive(string s);
    /// <summary>
    /// 发送命令数据
    /// </summary>
    public class SendData
    {
        public string Str { get; set; }
        public byte[] Bytes { get; set; }
    }
    /// <summary>
    /// 请求数据
    /// </summary>
    public class ListSendData
    {
        /// <summary>
        /// 命令数据
        /// </summary>
        public SendData SendData { get; set; }
        /// <summary>
        /// 回调方法
        /// </summary>
        public Receive Receive { get; set; }
    }
}
