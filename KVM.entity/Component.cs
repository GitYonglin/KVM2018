using LiteDB;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
  public class Component : Base
  {
    public string sName { get; set; }
    [BsonIgnore]
    public IEnumerable<Hole> Holes { get; set; }
  }

  public class Hole : Subset
  {
    public IEnumerable<string> Holes { get; set; }
    [JsonIgnore]
    [BsonIgnore]
    public IFormFile ImgFile { get; set; }
    public string ImgUrl { get; set; }
  }
}
