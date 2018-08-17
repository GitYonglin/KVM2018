using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
    public class Record
    {
        public string Id { get; set; }
        public int Stage { get; set; }
        public int State { get; set; }
        public IEnumerable<int> Time { get; set; }
        public int Mode { get; set; }
        public RecordMode Mpa { get; set; }
        public RecordMode Mm { get; set; }
        public CvsData CvsData { get; set; }
        public ReturnStart ReturnStart { get; set; }
    }

    public class CvsData
    {
        public IEnumerable<ulong> Time { get; set; }
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
        public ReturnStartItem A1 { get; set; }
        public ReturnStartItem A2 { get; set; }
        public ReturnStartItem B1 { get; set; }
        public ReturnStartItem B2 { get; set; }
    }
    public class ReturnStartItem
    {
        public float Mpa { get; set; }
        public float Mm { get; set; }
    }
}
