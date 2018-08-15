using LiteDB;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
    public class Base
    {
        public string Id { get; set; }
    }

    public class Subset : Base
    {
        public string sName { get; set; }
        public string ParentId { get; set; }
    }

    public class MenuData
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int State { get; set; }
    }
    public class TaskMenu : MenuData
    {
        public int Count { get; set; }
    }
    //public class Img
    //{
    //  [JsonIgnore]
    //  [BsonIgnore]
    //  public IFormFile ImgFile { get; set; }
    //  public string ImgUrl { get; set; }
    //}
}
