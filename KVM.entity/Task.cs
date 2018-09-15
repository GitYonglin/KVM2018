using LiteDB;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
    /// <summary>
    /// 梁数据
    /// </summary>
    public class Task : Base
    {
        /// <summary>
        /// 在项目ID
        /// </summary>
        public string ProjectId { get; set; }
        /// <summary>
        /// 梁名称
        /// </summary>
        public string BridgeName { get; set; }
        /// <summary>
        /// 使用钢绞线ID
        /// </summary>
        public string SteelStrandId { get; set; }
        /// <summary>
        /// 使用设备ID
        /// </summary>
        public string DeviceId { get; set; }
        /// <summary>
        /// 构建ID
        /// </summary>
        public string ComponentId { get; set; }
        /// <summary>
        /// 构建孔ID
        /// </summary>
        public string HoleId { get; set; }
        /// <summary>
        /// 试块编号
        /// </summary>
        public string skNumber { get; set; }
        /// <summary>
        /// 试块强度
        /// </summary>
        public string skIntensity { get; set; }
        /// <summary>
        /// 设计强度
        /// </summary>
        public string DesignIntensity { get; set; }
        /// <summary>
        /// 张拉强度
        /// </summary>
        public string TensionIntensity { get; set; }
        /// <summary>
        /// 浇筑日期
        /// </summary>
        public DateTime ConcretingDate { get; set; }
        /// <summary>
        /// 摩擦系数
        /// </summary>
        public string Friction { get; set; }
        /// <summary>
        /// 张拉孔数据明细
        /// </summary>
        [BsonIgnore]
        public IEnumerable<HoleGroup> HoleGroups { get; set; }
        /// <summary>
        /// 张拉组名称
        /// </summary>
        [BsonIgnore]
        public IEnumerable<HoleGroupsRadio> HoleGroupsRadio { get; set; }
        /// <summary>
        /// 使用设备明细
        /// </summary>
        [BsonIgnore]
        public Device Device { get; set; }
        /// <summary>
        /// 钢绞线明细
        /// </summary>
        [BsonIgnore]
        public SteelStrand SteelStrand { get; set; }
        /// <summary>
        /// 构建以及孔明细
        /// </summary>
        [BsonIgnore]
        public Component Component { get; set; }
        /// <summary>
        /// 孔道明细
        /// </summary>
        [BsonIgnore]
        public Hole Hole { get; set; }
    }
    /// <summary>
    /// 张拉孔数据
    /// </summary>
    public class HoleGroup : Subset
    {
        /// <summary>
        /// 孔名称
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// 张拉模式
        /// </summary>
        public int Mode { get; set; }
        //public float SuperTensionStageValue { get; set; }
        /// <summary>
        /// 张拉力
        /// </summary>
        public float TensionKn { get; set; }
        /// <summary>
        /// /张拉长度
        /// </summary>
        public float TensionLength { get; set; }
        /// <summary>
        /// 钢绞线数量
        /// </summary>
        public int SteelStrandNumber { get; set; }
        /// <summary>
        /// 张拉段数
        /// </summary>
        public string TensionStage { get; set; }
        /// <summary>
        /// 张拉阶段
        /// </summary>
        public IEnumerable<int> TensionStageValue { get; set; }
        /// <summary>
        /// 保压时间
        /// </summary>
        public IEnumerable<int> Time { get; set; }
        /// <summary>
        /// 超张拉
        /// </summary>
        public Boolean Super { get; set; }
        /// <summary>
        /// 二次张拉
        /// </summary>
        public Boolean Twice { get; set; }
        /// <summary>
        /// A1数据
        /// </summary>
        public ModeGroup A1 { get; set; }
        /// <summary>
        /// A2数据
        /// </summary>
        public ModeGroup A2 { get; set; }
        /// <summary>
        /// B1数据
        /// </summary>
        public ModeGroup B1 { get; set; }
        /// <summary>
        /// B2数据
        /// </summary>
        public ModeGroup B2 { get; set; }
    }
    /// <summary>
    /// 顶数据
    /// </summary>
    public class ModeGroup
    {
        /// <summary>
        /// 工作端伸长量
        /// </summary>
        public float WorkMm { get; set; }
        /// <summary>
        /// 回缩量
        /// </summary>
        public float RetractionMm { get; set; }
        /// <summary>
        /// 理论伸长量
        /// </summary>
        public float TheoryMm { get; set; }
    }
    /// <summary>
    /// 张拉组名称组
    /// </summary>
    public class HoleGroupsRadio
    {
        /// <summary>
        /// 张拉组ID
        /// </summary>
        public string Id { get; set; }
        /// <summary>
        /// 组名称
        /// </summary>
        public string Hole { get; set; }
        /// <summary>
        /// 张拉状态
        /// </summary>
        public int State { get; set; }
    }
    public class ConpomentHole
    {
        public string ComponetnName { get; set; }
        public Hole Hole { get; set; }
    }

    public class CopyTask
    {
        public string Id { get; set; }
        public string BridgeName { get; set; }
        public string HoleId { get; set; }
        public string ProjectId { get; set; }
    }

    public class Export
    {
        public IEnumerable<HoleGroup> HoleGroups { get; set; }
        public IEnumerable<Record> Records { get; set; }
    }
}
