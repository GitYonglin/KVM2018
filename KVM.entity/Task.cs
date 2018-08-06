using LiteDB;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
  public class Task : Base
  {
    public string ProjectId { get; set; }
    public string BridgeName { get; set; }
    public string SteelStrandName { get; set; }
    public string DeviceName { get; set; }
    public string DeviceId { get; set; }
    public string ComponentName { get; set; }
    public string ComponentId { get; set; }
    public string HoleName { get; set; }
    [JsonIgnore]
    [BsonIgnore]
    public IEnumerable<HoleGroup> HoleGroups { get; set; }
    [BsonIgnore]
    public IEnumerable<HoleGroupsRadio> HoleGroupsRadio { get; set; }
    [BsonIgnore]
    public Device Device { get; set; }
  }
  public class HoleGroup : Subset
  {
    public string Name { get; set; }
    public int Mode { get; set; }
    public float SuperTensionStageValue { get; set; }
    public float TensionKn { get; set; }
    public float TensionLength { get; set; }
    public int SteelStrandNumber { get; set; }
    public string TensionStage { get; set; }
    public IEnumerable<float> TensionStageValue { get; set; }
    public IEnumerable<int> Time { get; set; }
    public Boolean Super { get; set; }
    public Boolean Twice { get; set; }
    public ModeGroup A1 { get; set; }
    public ModeGroup A2 { get; set; }
    public ModeGroup B1 { get; set; }
    public ModeGroup B2 { get; set; }
  }

  public class ModeGroup
  {
    public float WorkMm { get; set; }
    public float RetractionMm { get; set; }
    public float TheoryMm { get; set; }
  }

  public class HoleGroupsRadio
  {
    public string Id { get; set; }
    public string Hole { get; set; }
  }
  public class CopyTask
  {
    public string Id { get; set; }
    public string BridgeName { get; set; }
    public string ComponentId { get; set; }
  }
}
