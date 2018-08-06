using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
  public class Device : Base
  {
    //    sName
    //  设备名称
    //必须输入。
    //sJackModel
    //千斤顶型号
    //sPumpModel
    //油泵型号
    //dCalibrationDate
    //标定日期
    //aWorkMode
    //设备工作模式
    //bEquation
    //标定方程式
    public string sName { get; set; }
    public string sJackModel { get; set; }
    public string sPumpModel { get; set; }
    public DateTime dCalibrationDate { get; set; }
    public IEnumerable<int> aWorkMode { get; set; }
    public Boolean bEquation { get; set; }
    public CalibrateCorrection A1 { get; set; }
    public CalibrateCorrection A2 { get; set; }
    public CalibrateCorrection B1 { get; set; }
    public CalibrateCorrection B2 { get; set; }
  }

  public class CalibrateCorrection
  {
    public Calibrate Calibrate { get; set; }
    public Correction Correction { get; set; }
  }

  public class Calibrate
  {
    //    sJackNumber
    //千斤顶编号
    //sPumpNumber
    //油泵编号
    //a
    //系数a
    //b
    //系数b
    public string sJackNumber { get; set; }
    public string sPumpNumber { get; set; }
    public float a { get; set; }
    public float b { get; set; }
  }

  public class Correction
  {
    public IEnumerable<float> Mm { get; set; }
    public IEnumerable<float> Mpa { get; set; }
  }
}
