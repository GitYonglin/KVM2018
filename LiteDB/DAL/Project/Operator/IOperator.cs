using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL.Project.Operator
{
  public interface IOperator : ISubset<entity.Operator>
  {
        IEnumerable<entity.Operator> GetAll(string id);
  }
}
