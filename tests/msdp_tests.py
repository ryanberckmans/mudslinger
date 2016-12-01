from unittest import TestCase
from app import parse_msdp, MSDPLookup


MSDP_dict = {v: k for k, v in MSDPLookup.iteritems()}


class TestParseMsdp(TestCase):
    def test_parse_server_id(self):
        msdp = "{VAR}SERVER_ID{VAL}Aarchon MUD".format(**MSDP_dict)
        exp = ("SERVER_ID", "Aarchon MUD")
        result = parse_msdp(msdp)
        self.assertEqual(exp, result)

    def test_parse_opponent_name_empty(self):
        msdp = "{VAR}OPPONENT_NAME{VAL}".format(**MSDP_dict)
        exp = ("OPPONENT_NAME", "")
        result = parse_msdp(msdp)
        self.assertEqual(exp, result)

    def test_parse_affects(self):
        msdp = ("{VAR}AFFECTS{VAL}{TABLE_OPEN}{VAR}fade{VAL}13{VAR}sanctuary{VAL}13"
                "{VAR}shield{VAL}29{TABLE_CLOSE}{VAR}MANA{VAL}14144").format(**MSDP_dict)
        exp = ("AFFECTS", {
            'fade': '13',
            'sanctuary': '13',
            'shield': '29'
        })
        result = parse_msdp(msdp)
        self.assertEqual(exp, result)

    def test_parse_room_exits(self):
        msdp = "{VAR}ROOM_EXITS{VAL}{TABLE_OPEN}{VAR}north{VAL}O{VAR}down{VAL}O{TABLE_CLOSE}".format(
            **MSDP_dict
        )
        exp = ("ROOM_EXITS", {
            'north': 'O',
            'down': 'O'
        })
        result = parse_msdp(msdp)
        self.assertEqual(exp, result)

    def test_parse_group_info(self):
        msdp = ("{VAR}GROUP_INFO{VAL}{TABLE_OPEN}{VAR}leader{VAL}Vodur{VAR}members{VAL}"
                "{ARRAY_OPEN}{VAL}{TABLE_OPEN}{VAR}name{VAL}Vodur"
                "{TABLE_CLOSE}{ARRAY_CLOSE}{TABLE_CLOSE}").format(**MSDP_dict)

        exp = (
            "GROUP_INFO",
            {
                'leader': 'Vodur',
                'members': [
                    {
                        'name': 'Vodur'
                    }
                ]
            }
        )
        result = parse_msdp(msdp)
        self.assertTupleEqual(exp, result)