using System;
using System.Collections.Generic;
using System.Text;

namespace MODBUS.ASCII
{
    public partial class ASCIIClient
    {
        /// <summary>
        /// 获取单个线圈
        /// </summary>
        /// <param name="ipAddress">设备地址</param>
        /// <param name="address">装置地址</param>
        /// <param name="data">设置数据</param>
        /// <param name="callback">回调</param>
        public void F01(int ipAddress, int address, int data, Receive callback)
        {

            SendData sendData = ASCIISend.F01(ipAddress, address, data);
            AddListSand(new ListSendData { SendData = sendData, Receive = callback });
        }
    }
}
