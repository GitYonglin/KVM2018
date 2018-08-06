using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL
{
  public interface ISubset<T> : IBase<T> where T : entity.Subset
  {
    IEnumerable<T> FindGetAll(string operatorId);
    IEnumerable<T> Delete(T data);
  }
}
