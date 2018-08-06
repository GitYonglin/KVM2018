using LiteDB;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL.Task.HoleGroup
{
  public class RHoleGroup: RSubset<entity.HoleGroup>, IHoleGroup
  {
    private LiteCollection<entity.HoleGroup> _col;
    public RHoleGroup(IOptions<DbString> dbString) : base(dbString)
    {
      _col = DbCollection<entity.HoleGroup>();
    }
  }
}
