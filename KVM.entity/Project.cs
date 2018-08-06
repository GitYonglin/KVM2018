using LiteDB;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
  public class Project : Base
  {
    //id: string;
    //sProjectName: string;   // 项目名称
    //sDivisionProject: string; // 分布工程
    //sConstructionUnit: string;  // 施工单位
    //sSubProject: string; // 分项工程
    //sUnitProject: string; // 单位工程
    //sEngineeringSite: string; // 工程部位
    //sContractSection: string; // 合同段
    //sStationRange: string; // 桩号范围
    //operator: Operator[]; // 操作员
    //supervision: Supervision[]; // 监理
    //steelStrand: SteelStrand[]; // 钢绞线
    //public string Id { get; set; }
    public string sProjectName { get; set; }
    public string sDivisionProject { get; set; }
    public string sConstructionUnit { get; set; }
    public string sSubProject { get; set; }
    public string sUnitProject { get; set; }
    public string sEngineeringSite { get; set; }
    public string sContractSection { get; set; }
    public string sStationRange { get; set; }
    //[BsonRef("Operators")]
    [BsonIgnore]
    public IEnumerable<Operator> Operators { get; set; }
    [BsonIgnore]
    public IEnumerable<Supervision> Supervisions { get; set; }
    [BsonIgnore]
    public IEnumerable<SteelStrand> SteelStrands { get; set; }
  }

  public class Operator: Subset
  {
    //id: string;
    //sName: string; // 姓名
    //sPassword: string; // 登录密码
    //sImage?: string; // 图片
    //sPhone?: string; // 手机号码
    //nAuthority: Number; // 权限管理
    //public string ProjectId { get; set; }
    //public string Id { get; set; }
    //public string sName { get; set; }
    public string sPassword { get; set; }
    public string nAuthority { get; set; }
    public string sPhone { get; set; }
    [JsonIgnore]
    [BsonIgnore]
    public IFormFile ImgFile { get; set; }
    public string ImgUrl { get; set; }
  }

  public class SteelStrand: Subset
  {
    //   sName: string; // 钢绞线名称
    //   sModel: string; // 钢绞线型号
    //   sFrictionCoefficient: string; // 摩擦系数
    //   sReportNo: string; // 报告编号
    //   dCalibrationDate: Date; // 标定日期
    public string sModel { get; set; }
    public string sFrictionCoefficient { get; set; }
    public string sReportNo { get; set; }
    public DateTime dCalibrationDate { get; set; }
    [JsonIgnore]
    [BsonIgnore]
    public IFormFile ImgFile { get; set; }
    public string ImgUrl { get; set; }
  }

  public class Supervision : Subset
  {
    //id: string;
    //sName: string; // 姓名
    //sPassword: string; // 登录密码
    //sImage?: string; // 图片
    //sPhone?: string; // 手机号码
    //nAuthority: Number; // 权限管理
    public string sPhone { get; set; }
    public string sUnit { get; set; }
    [JsonIgnore]
    [BsonIgnore]
    public IFormFile ImgFile { get; set; }
    public string ImgUrl { get; set; }
  }
}
