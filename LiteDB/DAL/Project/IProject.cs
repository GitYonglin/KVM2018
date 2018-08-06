using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL.Project
{
    public interface IProject: IBase<entity.Project>
    {
        Boolean UserLogin(entity.LoginData data, string id);
    }
}
