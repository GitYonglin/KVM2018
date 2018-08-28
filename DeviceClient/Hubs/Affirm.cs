using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DeviceClient.Hubs
{
    public class Affirm
    {
        public int No { get; set; }
        public int AffirmNo { get; set; }
        public delegate void Action();

        public bool AffirmIf(Action a)
        {
            AffirmNo++;
            if (AffirmNo >= No)
            {
                a.Invoke();
                No = 0;
                AffirmNo = 0;
            }
            return AffirmNo >= No;
        }
    }
}
