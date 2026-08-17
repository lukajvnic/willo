import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Field } from '@/components/controls';
import { Avatar, Card, Row, Rule, SectionHead } from '@/components/primitives';
import { Sheet } from '@/components/Sheet';
import { Txt } from '@/components/Type';
import { useStore } from '@/store/StoreContext';
import { color, space } from '@/theme';

/**
 * Account and friends. There's no server yet — this is the shape the sign-up
 * and friend graph will take once there is one.
 */
export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [name, setName] = useState(state.profile.name);
  const [email, setEmail] = useState(state.profile.email);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');

  const shareCount = (friendId: string) =>
    state.habits.filter((h) => h.sharedWith.includes(friendId)).length;

  const invite = () => {
    if (!inviteEmail.trim()) return;
    dispatch({ type: 'addFriend', name: inviteName, email: inviteEmail });
    setInviteEmail('');
    setInviteName('');
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow="Account"
      title={state.profile.name}
      footer={
        <>
          <Button
            label="Save"
            onPress={() => {
              dispatch({ type: 'setProfile', name: name.trim() || 'You', email: email.trim() });
              onClose();
            }}
            style={{ flex: 1 }}
          />
          <Button label="Close" onPress={onClose} tone="quiet" />
        </>
      }
    >
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <View style={{ flex: 1 }}>
          <Field label="Name" value={name} onChangeText={setName} />
        </View>
        <View style={{ flex: 1.4 }}>
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        </View>
      </View>

      <View style={{ gap: space.md }}>
        <SectionHead
          label="Friends"
          right={<Txt variant="micro">{state.friends.length}</Txt>}
          style={{ marginBottom: 0 }}
        />
        {state.friends.length === 0 ? (
          <Card>
            <Txt variant="body" color={color.faint}>
              No friends yet. Add someone by email to compare streaks.
            </Txt>
          </Card>
        ) : (
          <Card padded={false}>
            {state.friends.map((f, i) => {
              const shared = shareCount(f.id);
              return (
                <View key={f.id}>
                  {i > 0 ? <Rule /> : null}
                  <View style={s.row}>
                    <Avatar name={f.name} size={32} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Txt variant="title" style={{ fontSize: 15 }}>
                        {f.name}
                      </Txt>
                      <Txt variant="small" color={color.faint}>
                        {f.email}
                      </Txt>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Txt variant="micro">
                        {shared === 0 ? 'no shared habits' : `${shared} shared`}
                      </Txt>
                      <Button
                        label="Remove"
                        tone="ghost"
                        size="sm"
                        onPress={() => dispatch({ type: 'removeFriend', id: f.id })}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </View>

      <View style={{ gap: space.md }}>
        <SectionHead label="Add a friend" style={{ marginBottom: 0 }} />
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Field label="Name" value={inviteName} onChangeText={setInviteName} placeholder="Optional" />
          </View>
          <View style={{ flex: 1.4 }}>
            <Field
              label="Email"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="them@example.com"
              keyboardType="email-address"
            />
          </View>
        </View>
        <Row>
          <Button label="Send invite" onPress={invite} tone="quiet" size="sm" disabled={!inviteEmail.trim()} />
        </Row>
        <Txt variant="small" color={color.faint}>
          They'll see the habits you've shared and appear on those leaderboards.
        </Txt>
      </View>

      <View style={{ gap: space.md }}>
        <SectionHead label="Prototype data" style={{ marginBottom: 0 }} />
        <Txt variant="small" color={color.faint}>
          Everything lives in this browser. Reset to try the app from either end.
        </Txt>
        <Row gap={space.sm}>
          <Button
            label="Reload demo"
            tone="quiet"
            size="sm"
            onPress={() => {
              dispatch({ type: 'reset', mode: 'demo' });
              onClose();
            }}
          />
          <Button
            label="Start empty"
            tone="quiet"
            size="sm"
            onPress={() => {
              dispatch({ type: 'reset', mode: 'empty' });
              onClose();
            }}
          />
        </Row>
      </View>
    </Sheet>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
});
