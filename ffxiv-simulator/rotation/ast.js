﻿/**
 * 如果您想要修改循环设定文件，请参考文档修改：
 * 请勿修改以下代码直至xxx行
 * */
var potionEffect = 137;         // 4.0药水效果
var jobTrial = 1.3;             // 占星职业被动+30%伤害
var jobK = 33;                  // 占星职业K值：http://bbs.nga.cn/read.php?tid=12543882
var animationBlock = 63;        // 技能动作僵直默认0.63秒

class skill {

    constructor(data) {
        // 同步战斗数据
        this.setting = data.setting;            // 初始化设定
        this.player = data.player;              // 玩家动态属性
        this.battle = data.battle;
        this.statistic = data.statistic;
        this.isCrit = false;
        this.isDirectHit = false;
    }

    /**
     * 副属性公式参考：
     * https://docs.google.com/spreadsheets/d/1-w75RieKEHAvBiBO8AdHryAsg6TrvaPW5b5HBJzy170/edit?usp=sharing
     * */
    criticalHitModifier() {
        // 暴击buff判定
        var add = this.additive({
            'bard_aura': 0.02,
            'battle_litany': 0.15,
            'chain_strategem': 0.15
        });

        // 暴击判定
        if (this.setting.simulate.expectMode === true) {
            var p = floor((0.05 + (this.player.status.crt - 364) / 108.5 * 0.01 + add), 3);
            var k = floor((1.4 + (((this.player.status.crt - 364) / 108.5)) / 100), 3);
            return (1 + p * (k - 1));   // 期望模式下返回暴击期望加成
        } else {
            var p = floor((0.05 + (this.player.status.crt - 364) / 108.5 * 0.01 + add), 3);
            var test = Math.floor(Math.random() * 1001);
            if (_t <= Math.floor(p * 1000)) {
                this.isCrit = true;     // 记录暴击
                var k = floor((1.4 + (((this.player.status.crt - 364) / 108.5)) / 100), 3);
                return k;		        // 返回暴击加成
            } else {
                this.isCrit = false;    // 记录未暴击
                return 1;		        // 返回非暴击加成
            }
        }
    }

    directHitModifier() {
        // 直击buff判定
        var add = this.additive({
            'battle_voice': 0.15
        });

        // 直击判定
        if (this.setting.simulate.expectMode === true) {
            var p = floor(((DH - 364) / 39.09 * 0.01 + add), 3);
            var k = 1.25;
            return (1 + p * (k - 1)); // 期望模式下返回直击期望加成
        } else {
            var p = floor(((DH - 364) / 39.09 * 0.01 + add), 3);
            var test = Math.floor(Math.random() * 1001);
            if (_t <= Math.floor(p * 1000)) {
                this.isDirectHit = true; // 记录直击
                return 1.25;		// 返回直击加成
            } else {
                this.isDirectHit = false; // 记录未直击
                return 1;		// 返回非直击加成
            }
        }
    }

    // 技能伤害计算公式
    skillDamageCalculate(potency) {
        // 药水检测
        if (this.isBuff(this.player.buff.potion)) {
            this.player.status.ap = this.setting.status.ap + potionEffect;
        } else {
            this.player.status.ap = this.setting.status.ap;
        }
        // buff检测 && buff强化系数叠乘
        var m = this.multiplier({
            'trick_attack': 1.1,            // 忍者被刺
            'cleric_stance': 1.05,          // 治疗战姿
            'foe_requiem': 1.03             // 诗人魔人歌
        });
        // 伤害公式mod计算
        var apMod = Math.floor(100 * (this.player.status.ap - 58.4) / 233.6) / 100;
        var wdMod = (this.player.status.wd + jobK) / 100;
        var detMod = 1 + Math.floor(1000 * (this.player.status.det - 292) * 0.13 / 2170) / 1000;
        var tenMod = 1 + Math.floor(1000 * (this.player.status.ten - 364) * 0.1 / 2170) / 1000;
        var damageBase = Math.floor(Math.floor(Math.floor(Math.floor(potency * wdMod) * apMod) * detMod) * tenMod);
        critMod = this.criticalHitModifier();
        dhMod = this.directHitModifier();
        var resistanceMod = (this.isBuff(this.player.buff.resistance)) ? 1.1 : 1;
        var floatMod = this.damageFloat();
        return Math.floor(damageBase * critMod * dhMod * resistanceMod * floatMod);
    }

    // buff加成 (加法)
    additive(arr) {
        var a = 0;
        for (var k in arr) {
            if (typeof this.player.buff.k !== 'undefined' && this.player.buff.k > 0) {
                a += arr[k];
            }
        }
        return a;
    }

    // buff加成 (乘法)
    multiplier(arr) {
        var m = 1;
        for (var k in arr) {
            if (this.isBuff(this.player.buff.k)) {
                m *= arr[k];
            }
        }
        return m;
    }

    // buff检测
    isBuff(buff) {
        if (typeof buff !== 'undefined' && buff > 0) {
            return true;
        } else {
            return false;
        }
    }

    // 伤害浮动
    damageFloat() {
        if (this.setting.simulate.expectMode === true) {
            return 1;
        } else {
            return Math.floor(95 + Math.floor(Math.random() * 11)) / 100;
        }
    }

    // dot伤害加成
    dotMod() {
        return floor(1 + (((this.play.status.ss - 364) / 167)) / 100 , 3 );
    }

    // GCD计算
    calculateGCD() {
        var baseGCD = Math.floor(100 * (Math.floor(1000 * 2.5 * (1 - Math.floor(130 * (this.player.status.ss - 364) / 2170) / 1000)) / 1000));
        var m = (this.isBuff(this.player.buff.feys_wind)) ? (1 - 0.03) : 1;
        return Math.floor(baseGCD * m);
    }

    /** 
     * 下面是技能效果代码
     * */
    malefic_III() {
        var potency = 220;
        this.player.tick.animation = animationBlock;
        this.player.tick.cast = animationBlock;
        this.player.tick.gcd = this.calculateGCD();
    }

    combust_II() {
        var potency = 50;
        this.player.tick.animation = animationBlock;
        this.player.tick.gcd = this.calculateGCD();
        var dMod = this.dotMod();
        this.player.dot.combust_II.duration = 3000;
        this.player.dot.combust_II.damagePool = [];
        for (i = 0; i < 10; i++) {
            var dotTick = {
                'damage': Math.floor(this.skillDamageCalculate(potency)*dMod),
                'crit': this.isCrit,
                'dh': this.isDirectHit
            }
            this.player.dot.combust_II.damagePool.push(dotTick);
        }
    }

}

// 保留d位小数
function floor(num, d) {
    var k = Math.pow(10, d);
    return Math.floor(num * k) / k;
}

/**
 * 请勿修改以上代码
 * 以下内容为循环判定，请参考文档进行修改：
 * */

module.exports = {
    'logic': function (data) {
        var skill = new skill(data);
        if (data.player.trick.gcd < 0) {
            /* GCD技能循环逻辑 */
            if (data.)
        } else if (data.player.trick.gcd > 0.7) {
            /* 能力技循环逻辑 */

        }
    }
};