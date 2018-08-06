using System;
using System.Collections.Generic;
using System.Text;

namespace Modbus.ASCII
{
    public static class CommandCode
    {
        public static CommandData F01(int address, int data)
        {
            return LRCOnly(new List<int> { 1, 1, address, data });
        }
        public static CommandData F03(int address, int data)
        {
            return LRCOnly(new List<int> { 1, 3, address, data });
        }
        public static CommandData F05(int address, Boolean data)
        {
            int d = data ? 0xFF00 : 0;
            return LRCOnly(new List<int> { 1, 5, address, d });
        }
        public static CommandData F06(int address, int data)
        {
            return LRCOnly(new List<int> { 1, 6, address, data });
        }
        public static CommandData F16(int address, int[] data)
        {
            var list = new List<int> { 1, 16, address, data.Length, data.Length * 2 };
            list.AddRange(data);
            return LRCOnly(list);
        }

        private static CommandData LRCOnly(List<int> data)
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
            return new CommandData { Str = command, Bytes = Encoding.ASCII.GetBytes(command) };
        }
    }
    public class CommandData
    {
        public string Str { get; set; }
        public byte[] Bytes { get; set; }
    }
}
