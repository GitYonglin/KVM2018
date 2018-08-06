using System;
using System.Collections.Generic;
using System.Text;
using KVM.entity;
using LiteDB;
using Microsoft.Extensions.Options;

namespace KVM.LiteDB.DAL.Project.SteelStrand
{
  public class RSteelStrand : RSubset<entity.SteelStrand>, ISteelStrand
  {
    private LiteCollection<entity.SteelStrand> _col;
    public RSteelStrand(IOptions<DbString> dbString) : base(dbString)
    {
      _col = DbCollection<entity.SteelStrand>();
    }
  }
  }
