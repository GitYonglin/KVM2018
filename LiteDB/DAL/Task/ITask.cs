using KVM.entity;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL.Task
{
    public interface ITask : IBase<entity.Task>
    {
        IEnumerable<entity.TaskMenu> MenuData(string projectId);
        IEnumerable<entity.MenuData> MenuData(string projectId, string componentName);
        ReturnPost CopyInsert(entity.CopyTask copyTask);
        ReturnPost UpData(entity.Task data);
        Export Export(string id);
    }
}
