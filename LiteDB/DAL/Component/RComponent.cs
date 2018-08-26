using KVM.entity;
using LiteDB;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.LiteDB.DAL.Component
{
    public class RComponent : RBase<entity.Component>, IComponent
    {
        private LiteCollection<entity.Component> _col;
        private LiteCollection<entity.Hole> _holeCol;
        public RComponent(IOptions<DbString> dbString) : base(dbString)
        {
            _col = DbCollection<entity.Component>();
            _holeCol = DbCollection<entity.Hole>();
        }
        /// <summary>
        /// 添加一条数据
        /// </summary>
        /// <param name="data">数据</param>
        /// <returns></returns>
        public new ReturnPost Insert(entity.Component data)
        {
            if (_col.FindOne(p => p.sName == data.sName) == null)
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
        public new ReturnPost UpData(string id, entity.Component data)
        {
            if (_col.FindOne(p => p.sName == data.sName) == null)
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
        public new entity.Component GetOne(string id)
        {
            var component = _col.FindById(new BsonValue(id));
            component.Holes = _holeCol.Find(o => o.ParentId == id);
            return component;
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
                menuData.Add(new MenuData { Id = item.Id, Name = item.sName });
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
            _holeCol.Delete(o => o.ParentId == id);
            return "";
        }
    }
}
