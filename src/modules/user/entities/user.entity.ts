import { BaseEntity } from 'src/common/abstracts/base.entity';
import { EntityName } from 'src/common/enums/entity.enum';
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity(EntityName.User)
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  user_name: string;
  @Column({ nullable:true })
  passwrd: string;
  @Column({ nullable:true })
  email: string;
  @Column({ nullable:true})
  phone: string;
  @CreateDateColumn()
  creatde_at:Date;
  @UpdateDateColumn()
  updated_at:Date;

}
