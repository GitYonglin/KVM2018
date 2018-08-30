using KVM.entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL.Admin
{
    public interface IAdmin: IBase<entity.Admin>
    {
        ReturnLoging Login(entity.Admin admin);
    }
}
