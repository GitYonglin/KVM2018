using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using KVM.entity;
using LiteDB;
using Microsoft.Extensions.Options;

namespace KVM.LiteDB.DAL
{
  public class RBase<T> : DBContext, IBase<T> where T : class
  {
    private LiteCollection<T> _col;
    public RBase(IOptions<DbString> dbString) : base(dbString)
    {
      _col = DbCollection<T>();
    }

    public string Delete(string id)
    {
      return _col.Delete(new BsonValue(id)) ? "删除完成！" : "删除失败！";
    }

    public IEnumerable<T> GetAll()
    {
      return _col.FindAll();
    }

    public T GetOne(string id)
    {
      return _col.FindById(new BsonValue(id));
    }

    public ReturnPost Insert(T t)
    {
      throw new NotImplementedException();
    }

    public IEnumerable<MenuData> MenuData()
    {
      throw new NotImplementedException();
    }


    //public T Insert(T t)
    //{
    //    var v = _col.Insert(t);
    //    return GetOne(v);
    //}

    public ReturnPost UpData(string id, T t)
    {
      throw new NotImplementedException();
    }

  }
}
