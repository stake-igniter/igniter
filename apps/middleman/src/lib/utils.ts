import {StakeBin} from "@/types";

export function toStakeAmount(bin: StakeBin) {
    switch (bin) {
        case '15k':
            return 15000;
        case '30k':
            return 30000;
        case '45k':
            return 45000;
        case '60k':
            return 60000;
    }
}
