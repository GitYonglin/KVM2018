using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
    public class Record
    {
        public string Id { get; set; }
        public int Stage { get; set; }
        public IEnumerable<int> Time { get; set; }
        public int Mode { get; set; }
        public RecordMode Mpa { get; set; }
        public RecordMode Mm { get; set; }
        public CvsData CvsData { get; set; }
        public ReturnStart ReturnStart { get; set; }
    }

    public class CvsData
    {
        public string TimeState { get; set; }
        public string TimeEnd { get; set; }
        public int Skep { get; set; }
        public RecordMode Mpa { get; set; }
        public RecordMode Mm { get; set; }
        
    }
    public class RecordMode
    {
        public IEnumerable<float> A1 { get; set; }
        public IEnumerable<float> A2 { get; set; }
        public IEnumerable<float> B1 { get; set; }
        public IEnumerable<float> B2 { get; set; }
    }
    public class ReturnStart
    {
        public ReturnStart A1 { get; set; }
        public ReturnStart A2 { get; set; }
        public ReturnStart B1 { get; set; }
        public ReturnStart B2 { get; set; }
    }
    public class ReturnStartItem
    {
        public float Mpa { get; set; }
        public float Mm { get; set; }
    }
}
