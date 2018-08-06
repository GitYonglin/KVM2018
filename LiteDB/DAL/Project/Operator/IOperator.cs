using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL.Project.Operator
{
  public interface IOperator : ISubset<entity.Operator>
  {
  }
  //public interface IOperator: IBase<entity.Operator>
  //{
  //    IEnumerable<entity.Operator> FindGetAll(string operatorId);
  //    IEnumerable<entity.Operator> Delete(entity.Operator o);
  //}
}
