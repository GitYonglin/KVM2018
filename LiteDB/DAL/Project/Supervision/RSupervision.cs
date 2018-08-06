using System;
using System.Collections.Generic;
using System.Text;
using KVM.entity;
using LiteDB;
using Microsoft.Extensions.Options;

namespace KVM.LiteDB.DAL.Project.Supervision
{
  public class RSupervision : RSubset<entity.Supervision>, ISupervision
  {
    private LiteCollection<entity.Supervision> _col;
    public RSupervision(IOptions<DbString> dbString) : base(dbString)
    {
      _col = DbCollection<entity.Supervision>();
    }
  }
  }
