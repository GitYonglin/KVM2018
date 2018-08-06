using LiteDB;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL.Component.Hole
{
  public class RHole : RSubset<entity.Hole>, IHole
  {
    private LiteCollection<entity.Hole> _col;
    public RHole(IOptions<DbString> dbString) : base(dbString)
    {
      _col = DbCollection<entity.Hole>();
    }
  }
}
