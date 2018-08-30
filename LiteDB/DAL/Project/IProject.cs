using KVM.entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL.Project
{
    public interface IProject: IBase<entity.Project>
    {
        ReturnLoging UserLogin(entity.LoginData data, string id);
    }
}
