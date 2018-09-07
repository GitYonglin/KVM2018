using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DeviceClient.Hubs
{
    public class InPLC
    {
        public int Id { get; set; }
        public int Address { get; set; }
        public Boolean F05 { get; set; }
        public int F01 { get; set; }
        public int F06 { get; set; }
        public int F03 { get; set; }
        public int Mode { get; set; }
        public int[] F16 { get; set; }
    }
    public class SetDeviceParameterData
    {
        public int Address { get; set; }
        public int Mode { get; set; }
        public int[] Values { get; set; }
    }
    public class MpaUP
    {
        public int Address { get; set; }
        public int Mode { get; set; }
        public int A1 { get; set; }
        public int A2 { get; set; }
        public int B1 { get; set; }
        public int B2 { get; set; }
    }

}
