using System;
using System.Collections.Generic;
using System.Text;

namespace MODBUS
{
    public static class DVP
    {
        public static int Y(int site)
        {
            return 1280 + site;
        }
        public static int M(int site)
        {
            return 2048 + site;
        }
        public static int D(int site)
        {
            return 4096 + site;
        }
    }
}
