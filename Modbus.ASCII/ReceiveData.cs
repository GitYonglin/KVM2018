using System;
using System.Collections.Generic;
using System.Text;

namespace Modbus.ASCII
{
    public static class ReceiveData
    {
        public static bool F05(byte[] types)
        {
            //var v = data.Substring(9).Substring(0, 1);
            return types[9] == 'F';
        }
        public static object F01(byte[] types)
        {
            return (object)new Boolean[] { true, false, true };
        }
        public static List<int> F03(byte[] types, int number)
        {
            List<int> rList = new List<int>();
            var str = Encoding.ASCII.GetString(types);
            for (int i = 7; i < number * 4 + 7; i += 4)
            {
                rList.Add(Convert.ToInt32(str.Substring(i, 4), 16));
            }
            return rList;
        }
    }
    public class ReceiveReturnData<T>
    {
        public T Data { get; set; }
    }

}
