using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using KVM.entity;
using LiteDB;
using Microsoft.Extensions.Options;

namespace KVM.LiteDB.DAL.Project
{
    public class RProject : RBase<entity.Project>, IProject
    {
        private LiteCollection<entity.Project> _col;
        private LiteCollection<entity.Operator> _operatorCol;
        private LiteCollection<entity.Supervision> _supervisionCol;
        private LiteCollection<entity.SteelStrand> _steelStrandCol;
        public RProject(IOptions<DbString> dbString) : base(dbString)
        {
            _col = DbCollection<entity.Project>();
            _operatorCol = DbCollection<entity.Operator>();
            _supervisionCol = DbCollection<entity.Supervision>();
            _steelStrandCol = DbCollection<entity.SteelStrand>();
        }
        /// <summary>
        /// 添加一条数据
        /// </summary>
        /// <param name="data">数据</param>
        /// <returns></returns>
        public new ReturnPost Insert(entity.Project data)
        {
            if (_col.FindOne(p => p.sProjectName == data.sProjectName) == null)
            {
                _col.Insert(data);
                return new ReturnPost() { Data = data, Message = true };
            }
            return new ReturnPost() { Message = false };
        }
        /// <summary>
        /// 修改一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <param name="data">数据</param>
        /// <returns></returns>
        public new ReturnPost UpData(string id, entity.Project data)
        {
            var searchData = _col.Find(p => p.sProjectName == data.sProjectName);
            if (searchData.Count() == 0 || (searchData.Count() == 1 && searchData.Select(s => s.Id == id).Count() == 1))
            {
                var old = _col.FindById(id);
                var updata = Class2Class.C2C(old, data);
                if (_col.Update(updata))
                {
                    return new ReturnPost() { Data = updata, Message = true };
                }
            }
            return new ReturnPost() { Message = false };
        }
        /// <summary>
        /// 获取一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns></returns>
        public new entity.Project GetOne(string id)
        {
            var project = _col.FindById(new BsonValue(id));
            project.Operators = _operatorCol.Find(o => o.ParentId == id);
            project.Supervisions = _supervisionCol.Find(o => o.ParentId == id);
            project.SteelStrands = _steelStrandCol.Find(o => o.ParentId == id);
            return project;
        }

        /// <summary>
        /// 获取菜单显示数据
        /// </summary>
        /// <returns></returns>
        public new IEnumerable<MenuData> MenuData()
        {
            var obj = _col.FindAll();
            List<MenuData> menuData = new List<MenuData>();
            foreach (var item in obj)
            {
                menuData.Add(new MenuData { Id = item.Id, Name = item.sProjectName });
            }
            return menuData;
        }

        /// <summary>
        /// 删除一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns></returns>
        public new string Delete(string id)
        {
            _col.Delete(id);
            _operatorCol.Delete(o => o.ParentId == id);
            _supervisionCol.Delete(o => o.ParentId == id);
            _steelStrandCol.Delete(o => o.ParentId == id);
            return "";
        }

        public ReturnLoging UserLogin(LoginData data, string id)
        {
            var user = _operatorCol.FindOne(o => o.ParentId == id && o.sName == data.Name && o.sPassword == data.Password);
            if (user == null)
            {
                return null;
            } else
            {
                return new ReturnLoging { Id = user.Id, Super=false, MenuAuthority=user.MenuAuthority, OperatorAuthority=user.OperatorAuthority };
            }
        }
    }
}
