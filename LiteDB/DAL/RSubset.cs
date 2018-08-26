using LiteDB;
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Options;
using System.Text;

namespace KVM.LiteDB.DAL
{
    public class RSubset<T> : RBase<T>, ISubset<T> where T : entity.Subset
    {
        private LiteCollection<T> _col;
        public RSubset(IOptions<DbString> dbString) : base(dbString)
        {
            _col = DbCollection<T>();
        }

        /// <summary>
        /// 添加一条数据
        /// </summary>
        /// <param name="data">数据</param>
        /// <returns>成功：返回项目中所有操作员，失败：放回状态false</returns>
        public new ReturnPost Insert(T data)
        {
            if (_col.FindOne(item => item.sName == data.sName) == null)
            {
                _col.Insert(data);

                return new ReturnPost() { Data = _col.Find(item => item.ParentId == data.ParentId), Message = true };
            }
            return new ReturnPost() { Message = false };
        }
        /// <summary>
        /// 获取所有数据
        /// </summary>
        /// <param name="ParentId">项目Id</param>
        /// <returns>返回项目中所有数据</returns>
        public IEnumerable<T> FindGetAll(string ParentId)
        {
            return _col.Find(o => o.ParentId == ParentId);
        }
        public new T GetOne(string id)
        {
            return _col.FindOne(o => o.Id == id);
        }
        /// <summary>
        /// 更新一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <param name="data">更新的数据</param>
        /// <returns>成功：返回项目中所有操作员，失败：放回状态false</returns>
        public new ReturnPost UpData(string id, T data)
        {
            if (_col.FindOne(item => item.sName == data.sName) == null)
            {
                var old = _col.FindById(id);
                var updata = Class2Class.C2C(old, data);
                if (_col.Update(updata))
                {
                    return new ReturnPost() { Data = FindGetAll(updata.ParentId), Message = true };
                }
            }
            return new ReturnPost() { Message = false };
        }
        /// <summary>
        /// 删除一条操作员数据
        /// </summary>
        /// <param name="o">数据</param>
        /// <returns>返回项目中所有操作员</returns>
        public IEnumerable<T> Delete(T o)
        {
            if (_col.Delete(o.Id))
            {
                return FindGetAll(o.ParentId);
            }
            return null;

        }
    }
}

