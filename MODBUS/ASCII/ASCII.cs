using System;
using System.Collections.Generic;
using System.Text;
using System.Net.Sockets;


namespace MODBUS.ASCII
{

    public partial class ASCIIClient: SocketLink
    {
        public ASCIIClient(string Ip, int Port) : base(Ip, Port)
        {
        }

        public void F03(int ipAddress, int address, int data, Receive callback)
        {
            SendData sendData = ASCIISend.F03(ipAddress, address, data);
            AddListSand(new ListSendData { SendData = sendData, Receive = callback });
        }
        /// <summary>
        /// 设置单个线圈 功能码=F05
        /// </summary>
        /// <param name="address">设置线圈地址</param>
        /// <param name="data">设置线圈状态 true通，false断</param>
        /// <returns>返回 IsSuccess：请求结果True=成功，Message：信息，Data.Data：返回数据</returns>
        public void F05(int ipAddress, int address, Boolean data, Receive callback)
        {
            SendData sendData = ASCIISend.F05(ipAddress, address, data);
            AddListSand(new ListSendData { SendData = sendData, Receive = callback });
        }
        public void F06(int ipAddress, int address, int data, Receive callback)
        {
            SendData sendData = ASCIISend.F06(ipAddress, address, data);
            AddListSand(new ListSendData { SendData = sendData, Receive = callback });
        }
        public void F16(int ipAddress, int address, int[] data, Receive callback)
        {
            SendData sendData = ASCIISend.F16(ipAddress, address, data);
            AddListSand(new ListSendData { SendData = sendData, Receive = callback });
        }

    }
}
