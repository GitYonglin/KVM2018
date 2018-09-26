using System;
using System.Collections.Generic;
using System.Text;

namespace MODBUS.ASCII
{
    public class ASCIISend
    {
        /// <summary>
        /// 读取线圈
        /// </summary>
        /// <param name="ipAddress">设备地址</param>
        /// <param name="address">装置首地址</param>
        /// <param name="number">读取数量</param>
        /// <returns></returns>
        public static SendData F01(int ipAddress, int address, int number)
        {
            return LRCOnly(new List<int> { ipAddress, 1, address, number });
        }
        /// <summary>
        /// 读取寄存器
        /// </summary>
        /// <param name="ipAddress">设备地址</param>
        /// <param name="address">装置首地址</param>
        /// <param name="number">读取数量</param>
        /// <returns></returns>
        public static SendData F03(int ipAddress, int address, int number)
        {
            return LRCOnly(new List<int> { ipAddress, 3, address, number });
        }
        /// <summary>
        /// 设置单个线圈
        /// </summary>
        /// <param name="ipAddress">设备地址</param>
        /// <param name="address">装置地址</param>
        /// <param name="state">设置状态</param>
        /// <returns></returns>
        public static SendData F05(int ipAddress, int address, Boolean state)
        {
            int h = state ? 0xFF00 : 0;
            return LRCOnly(new List<int> { ipAddress, 5, address, h });
        }
        /// <summary>
        /// 设置单个寄存器
        /// </summary>
        /// <param name="ipAddress">设备地址</param>
        /// <param name="address">装置地址</param>
        /// <param name="data">设置数据</param>
        /// <returns></returns>
        public static SendData F06(int ipAddress, int address, int data)
        {
            return LRCOnly(new List<int> { ipAddress, 6, address, data });
        }
        /// <summary>
        /// 设置多个寄存器
        /// </summary>
        /// <param name="ipAddress">设备地址</param>
        /// <param name="address">装置地址</param>
        /// <param name="data">设置数据</param>
        /// <returns></returns>
        public static SendData F16(int ipAddress, int address, int[] data)
        {
            var list = new List<int> { ipAddress, 16, address, data.Length, data.Length * 2 };
            list.AddRange(data);
            return LRCOnly(list);
        }

        private static SendData LRCOnly(List<int> data)
        {
            StringBuilder sb = new StringBuilder();
            int sum = 0;
            for (int i = 0; i < data.Count; i++)
            {
                int item = data[i];
                if (i < 2 || (data[1] == 16 && i == 4))
                {
                    sum += item;
                    sb.Append(Convert.ToString(item, 16).PadLeft(2, '0'));
                }
                else
                {
                    var s = Convert.ToString(item, 16).PadLeft(4, '0');
                    int high = Convert.ToInt32(s.Substring(0, 2), 16);
                    int low = Convert.ToInt32(s.Substring(2), 16);
                    sum = sum + high + low;
                    sb.Append(s);
                }
            }
            sum = 255 - sum % 256 + 1;
            sb.Append(Convert.ToString(sum, 16).PadLeft(2, '0'));
            string command = $":{sb.ToString()}\r\n".ToUpper();
            return new SendData { Str = command, Bytes = Encoding.ASCII.GetBytes(command) };
        }
    }
}
