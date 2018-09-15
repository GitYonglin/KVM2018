using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using KVM.entity;
using LiteDB;
using Microsoft.Extensions.Options;

namespace KVM.LiteDB.DAL.Project.SteelStrand
{
    public class RSteelStrand : RSubset<entity.SteelStrand>, ISteelStrand
    {
        private LiteCollection<entity.SteelStrand> _col;
        private LiteCollection<entity.Task> _task;
        public RSteelStrand(IOptions<DbString> dbString) : base(dbString)
        {
            _col = DbCollection<entity.SteelStrand>();
            _task = DbCollection<entity.Task>();
        }
        /// <summary>
        /// 删除一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns></returns>
        public new string Delete(string id)
        {
            var del = _col.FindById(id);
            var task = _task.Find(t => t.SteelStrandId == id).Count();
            if (task == 0)
            {
                _col.Delete(id);
                return "";
            }
            return "正在使用中，不允许删除！！！";
        }
    }
}
