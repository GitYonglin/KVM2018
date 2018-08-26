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

        public IEnumerable<entity.Operator> GetAll(string id)
        {
            return _col.Find(o => o.ParentId == id);
        }
    }
  }
