using System;
using System.Collections.Generic;
using System.Text;
using KVM.entity;
using LiteDB;
using Microsoft.Extensions.Options;

namespace KVM.LiteDB.DAL.Admin
{
    public class RAdmin : RBase<entity.Admin>, IAdmin
    {
        private LiteCollection<entity.Admin> _col;
        public RAdmin(IOptions<DbString> dbString) : base(dbString)
        {
            _col = DbCollection<entity.Admin>();
        }

        public new ReturnPost Insert(entity.Admin data)
        {
            if (_col.FindOne(item => item.Name == data.Name) == null)
            {
                _col.Insert(data);
                return new ReturnPost() { Data = data, Message = true };
            }
            return new ReturnPost() { Message = false };
        }

        public Boolean Login(entity.Admin admin)
        {
            var get = _col.FindOne(a => a.Name == admin.Name && a.Password == admin.Password);
            return get == null ? false : true;
        }
    }
}
