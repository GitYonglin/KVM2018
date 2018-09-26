using System;
using System.Collections.Generic;
using System.Text;

namespace MODBUS.ASCII
{
    public static class ASCIIReceive
    {
        public static List<int> F03(string data, int number)
        {
            List<int> rList = new List<int>();
            try
            {
                for (int i = 7; i < number * 4 + 7; i += 4)
                {
                    rList.Add(Convert.ToInt32(data.Substring(i, 4), 16));
                }
                return rList;
            }
            catch (Exception)
            {

                return rList;
            }
        }
    }
}
