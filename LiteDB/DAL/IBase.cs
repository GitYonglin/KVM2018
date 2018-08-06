using LiteDB;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL
{
  public interface IBase<T> where T : class
  {
    IEnumerable<T> GetAll();
    ReturnPost Insert(T t);
    ReturnPost UpData(string id, T t);
    T GetOne(string id);
    string Delete(string id);
    IEnumerable<entity.MenuData> MenuData();
  }

  public class ReturnPost
  {
    public Object Data { get; set; }
    public Boolean Message { get; set; }
  }
}
