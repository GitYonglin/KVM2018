using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL.Component.Hole
{
  public interface IHole : ISubset<entity.Hole>
  {
        ReturnPost UpData(entity.Hole data);
  }
}
