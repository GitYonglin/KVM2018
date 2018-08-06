using System;
using System.Collections.Generic;
using System.Text;
using KVM.entity;
using LiteDB;
using Microsoft.Extensions.Options;

namespace KVM.LiteDB.DAL.Project.Operator
{
  public class ROperator : RSubset<entity.Operator>, IOperator
  {
    private LiteCollection<entity.Operator> _col;
    public ROperator(IOptions<DbString> dbString) : base(dbString)
    {
      _col = DbCollection<entity.Operator>();
    }
  }
    //public class ROperator : RBase<entity.Operator>, IOperator
    //{
    //  private LiteCollection<entity.Operator> _col;
    //  public ROperator(IOptions<DbString> dbString) : base(dbString)
    //  {
    //    _col = DbCollection<entity.Operator>();
    //  }

    //  /// <summary>
    //  /// 添加一条数据
    //  /// </summary>
    //  /// <param name="data">数据</param>
    //  /// <returns>成功：返回项目中所有操作员，失败：放回状态false</returns>
    //  public new ReturnPost Insert(entity.Operator data)
    //  {
    //    if (_col.FindOne(item => item.sName == data.sName) == null)
    //    {
    //      _col.Insert(data);

    //      return new ReturnPost() { Data = _col.Find(item => item.ProjectId == data.ProjectId), Message = true };
    //    }
    //    return new ReturnPost() { Message = false };
    //  }
    //  /// <summary>
    //  /// 获取显目中所有操作员
    //  /// </summary>
    //  /// <param name="projectId">项目Id</param>
    //  /// <returns>返回项目中所有操作员</returns>
    //  public IEnumerable<entity.Operator> FindGetAll(string projectId)
    //  {
    //    return _col.Find(o => o.ProjectId == projectId);
    //  }
    //  /// <summary>
    //  /// 更新一条数据
    //  /// </summary>
    //  /// <param name="id">Id</param>
    //  /// <param name="data">更新的数据</param>
    //  /// <returns>成功：返回项目中所有操作员，失败：放回状态false</returns>
    //  public new ReturnPost UpData(string id, entity.Operator data)
    //  {
    //    var old = _col.FindById(id);
    //    var updata = Class2Class.C2C(old, data);
    //    if (_col.Update(updata))
    //    {
    //      return new ReturnPost() { Data = FindGetAll(updata.ProjectId), Message = true };
    //    }
    //    return new ReturnPost() { Message = false };
    //  }
    //  /// <summary>
    //  /// 删除一条操作员数据
    //  /// </summary>
    //  /// <param name="o">数据</param>
    //  /// <returns>返回项目中所有操作员</returns>
    //  public IEnumerable<entity.Operator> Delete(entity.Operator o)
    //  {
    //    if (_col.Delete(o.Id))
    //    {
    //      return FindGetAll(o.ProjectId);
    //    }
    //    return null;

    //  }
    //}
  }
